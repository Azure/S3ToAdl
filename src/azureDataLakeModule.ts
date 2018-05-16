import * as AWS from "aws-sdk";
import * as adlsManagement from "azure-arm-datalake-store";
import * as fs from "fs";
import * as path from "path";
import * as filesHelper from "./filesHelper";
import { winston } from "./logger";

export class AzureDataLakeModule {
  private filesystemClient: adlsManagement.DataLakeStoreFileSystemClient;
  private accountName: string;
  private tempFolder: string;
  private bucketName: string;

  constructor(accountName: string, tempFolder: string, fileSystemClient: adlsManagement.DataLakeStoreFileSystemClient,
    bucketName: string) {
    this.accountName = accountName;
    this.tempFolder = tempFolder;
    this.filesystemClient = fileSystemClient;
    this.bucketName = bucketName;
  }

  /**
   * Checks if aws file exists in ADL, or if S3 holds a newer version of file
   * @param awsFile - the file to validate
   */
  public async shouldUploadToADL(awsFile: AWS.S3.Object): Promise<boolean> {
    const fileFullName = this.bucketName + "/" + awsFile.Key;
    try {
      const file = await this.filesystemClient.fileSystem.getFileStatus(this.accountName, fileFullName);
      winston.verbose(`file: ${fileFullName} already exists in data lake`);

      // If file exist in Azure Data Lake but it"s been updated in aws - upload it again
      return file.fileStatus.modificationTime < awsFile.LastModified.getTime();
    }
    catch (ex) {
      if (ex.body && ex.body && ex.body.remoteException && ex.body.remoteException.exception === "FileNotFoundException") {
        winston.info(`file: ${fileFullName} doesn't exists in ADL`);
        return true;
      } else {
        winston.error(`shouldUploadToADL unknown error: ${ex}`);
        throw ex;
      }
    }
  }

  /**
   *  Upload local file to ADL.
   *  Validates that all directories in the file path exists in ADL files system - if not create the missing directories
   * @param filePath - the path where the file to upload is located
   */
  public async uploadFileToAzureDataLake(filePath: string): Promise<void> {
    const filePathToUpload = this.bucketName + "/" + filePath;
    const directoriesList = filesHelper.getDirectoriesPathArray(filePathToUpload);
    const localFilePath = path.join(this.tempFolder, filePath);

    try {
      // Create folders in ADL if needed
      await this.filesystemClient.fileSystem.mkdirs(this.accountName, directoriesList.join("/"));

      const options = {
        overwrite: true,
        streamContents: fs.createReadStream(localFilePath),
      };

      // Upload file to Azure Data Lake
      
      await this.filesystemClient.fileSystem.create(this.accountName, filePathToUpload, options);
      winston.info(`Upload file ${filePathToUpload} successfully`);
    } catch (ex) {
      winston.error(`error while uploading file to ADL: ${ex}`);
      throw ex;
    }
  }
}
