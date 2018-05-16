import * as async from "async";
import * as parallel from "async-await-parallel";
import * as AWS from "aws-sdk";
import * as adlsManagement from "azure-arm-datalake-store";
import * as msrestAzure from "ms-rest-azure";
import * as path from "path";
import * as redis from "redis";
import { AwsS3Module } from "./awsS3Module";
import { AzureDataLakeModule } from "./azureDataLakeModule";
import { createDirIfNotExists, deleteFile, deleteFolder, getDirectoriesPathArray } from "./filesHelper";
import { winston } from "./logger";
import { RedisModule, RedisObject } from "./redisModule";

export class S3ToAdlDataCopy {
  public awsClient: AWS.S3;
  public adlClient: adlsManagement.DataLakeStoreFileSystemClient;
  public awsBucketName: string;
  public azureAdlAccountName: string;
  public copyProperties: { batchNumber: number, uploadedCount: 0 } = { batchNumber: 0, uploadedCount: 0 };

  private concurrencyNumber = process.env.CONCURRENCY_NUMBER || 10;
  private tempFolder: string;
  private awsAccessKeyId: string;
  private awsAccessSecretKey: string;
  private awsRegion: string;
  private azureClientId: string;
  private azureDomain: string;
  private azureSecret: string;
  private useRedis: boolean;
  private redisPort: string;
  private redisHost: string;

  constructor() {
    this.validateEnvironmentVariables();

    this.tempFolder = process.env.TEMP_FOLDER;
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.awsAccessSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.awsRegion = process.env.AWS_REGION;
    this.awsBucketName = process.env.AWS_BUCKET_NAME;
    this.azureAdlAccountName = process.env.AZURE_ADL_ACCOUNT_NAME;
    this.azureClientId = process.env.AZURE_CLIENT_ID;
    this.azureDomain = process.env.AZURE_DOMAIN;
    this.azureSecret = process.env.AZURE_SECRET;
    this.useRedis = process.env.USE_REDIS !== undefined ? process.env["USE_REDIS"].toLowerCase() === "true" : false;
    this.redisPort = process.env.REDIS_PORT || "6379";
    this.redisHost = process.env.REDIS_HOST || "redis";
    // Initialize clients
    this.awsClient = this.initializeAwsClient(this.awsAccessKeyId, this.awsAccessSecretKey, this.awsRegion);
    this.adlClient = this.initializeAdlClient(this.azureClientId, this.azureDomain, this.azureSecret);
  }

  public async handler(cb) {
    // create temp directory with cache directory inside to download files from s3 and upload it to ADL.
    // In the end of the run the cache directory will be deleted.
    createDirIfNotExists(null, null, this.tempFolder);
    this.tempFolder += "/cache";
    createDirIfNotExists(null, null, this.tempFolder);

    const awsModule = new AwsS3Module(this.awsBucketName, this.tempFolder, this.awsClient);
    const adlModule = new AzureDataLakeModule(this.azureAdlAccountName, this.tempFolder, this.adlClient, this.awsBucketName);
    const redisModule = this.useRedis ? new RedisModule(this.initializeRedisClient(this.redisPort, this.redisHost), this.awsBucketName) : null;

    if (this.useRedis) {
      winston.info("Using Redis");
    } else {
      winston.info("Not using Redis");
    }

    await this.batchIterationOverS3Items(awsModule, adlModule, redisModule);

    // After all uploads are completed, delete the cache directory and its sub directories.
    await deleteFolder(this.tempFolder);
    winston.info("all done");
    cb();
  }

  /**
   *  Go over the items in S3 in batches of 1000.
   *  For each file in batch check if it is missing from ADL lake, if so download it to temp directory and upload to ADL.
   */
  public async batchIterationOverS3Items(awsS3Module: AwsS3Module, adlModule: AzureDataLakeModule, redisModule: RedisModule): Promise<void> {
    let awsObjectsOutput: AWS.S3.ListObjectsOutput;
    let marker = "";
    this.copyProperties.batchNumber = 1;

    do {
      winston.info(`Processing batch #${this.copyProperties.batchNumber}`);
      awsObjectsOutput = await awsS3Module.listAllObjects(marker);

      if (awsObjectsOutput && awsObjectsOutput.Contents && awsObjectsOutput.Contents.length > 0) {
        let awsObjects = awsObjectsOutput.Contents;
        // Filter out the directories names - aws.listObjects returns all files in the bucket including directories names
        awsObjects = awsObjects.filter((obj) => !obj.Key.endsWith("/"));

        const promiseArray = awsObjects.map(key => {
          return async () => {
            try {
              if (await this.shouldUploadFile(redisModule, adlModule, key)) {
                await awsS3Module.downloadFileFromS3(key);
                // Upload File if it doesn't exist in ADL or if a new version of the file exists in S3
                await adlModule.uploadFileToAzureDataLake(key.Key);
                this.copyProperties.uploadedCount++;
                deleteFile(path.join(this.tempFolder, key.Key));
                // Update redis with the new file
                if (this.useRedis) {
                  await redisModule.addFileToRedis(key);
                }
              }
            } catch (ex) {
              winston.error(`error was thrown while working on element ${key.Key} ${ex}`);
            }
          };
        });

        try {
          await parallel(promiseArray, this.concurrencyNumber);
        } catch (ex) {
          winston.error(ex);
        }

        marker = awsObjects[awsObjects.length - 1].Key;
        this.copyProperties.batchNumber++;
      }
    } while (awsObjectsOutput.IsTruncated);
  }

  public async shouldUploadFile(redisModule: RedisModule, adlModule: AzureDataLakeModule, key: AWS.S3.Object) {
    let shouldUploadFile: boolean;
    
    if (this.useRedis) {
      let obj: RedisObject = await redisModule.isFileInRedis(key);
      if (obj === null) {
        // Object is not in redis - check in ADL if it should be upload and update redis anyway
        shouldUploadFile = await adlModule.shouldUploadToADL(key);
        // if file already exists in ADL, just update redis.
        if (!shouldUploadFile) {
          await redisModule.addFileToRedis(key);
        }
      } else {
        // Check if file was modified since the last time it was uploaded
        shouldUploadFile = obj.ETag !== key.ETag;
      }
    } else {
      shouldUploadFile = await adlModule.shouldUploadToADL(key);
    }

    return shouldUploadFile;
  }

  private validateEnvironmentVariables() {
    const variablesList = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_BUCKET_NAME",
      "AZURE_CLIENT_ID", "AZURE_DOMAIN", "AZURE_SECRET", "AZURE_ADL_ACCOUNT_NAME", "TEMP_FOLDER"];

    variablesList.forEach((variable) => {
      if (!process.env[variable]) {
        throw new Error(`Environment Variable ${variable} is not defined`);
      }
    });

    if (process.env["USE_REDIS"]) {
      if (process.env["USE_REDIS"].toLowerCase() !== "true" && process.env["USE_REDIS"].toLowerCase() !== "false") {
        throw new Error(`Environment Variable USE_REDIS should contain boolean value`);
      }
    }

  }

  private initializeAwsClient(accessKeyId: string, secretAccessKey: string, region: string): AWS.S3 {
    try {
      const config = { accessKeyId, secretAccessKey, region };
      return new AWS.S3(config);
    } catch (ex) {
      winston.info(`error initializing s3 client: ${ex}`);
      throw ex;
    }
  }

  private initializeAdlClient(clientId: string, domain: string, secret: string): adlsManagement.DataLakeStoreFileSystemClient {
    try {
      const credentials = new msrestAzure.ApplicationTokenCredentials(clientId, domain, secret);
      return new adlsManagement.DataLakeStoreFileSystemClient(credentials);
    } catch (ex) {
      winston.error(`error initializing Azure client ${ex}`);
      throw ex;
    }
  }

    private initializeRedisClient(port: string, host: string): redis.client {
    try {
      return redis.createClient(port, host);
    } catch (ex) {
      winston.error(`error initializing redis client ${ex}`);
      throw ex;
    }
  }
}