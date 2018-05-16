"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parallel = require("async-await-parallel");
const AWS = require("aws-sdk");
const adlsManagement = require("azure-arm-datalake-store");
const msrestAzure = require("ms-rest-azure");
const path = require("path");
const redis = require("redis");
const awsS3Module_1 = require("./awsS3Module");
const azureDataLakeModule_1 = require("./azureDataLakeModule");
const filesHelper_1 = require("./filesHelper");
const logger_1 = require("./logger");
const redisModule_1 = require("./redisModule");
class S3ToAdlDataCopy {
    constructor() {
        this.copyProperties = { batchNumber: 0, uploadedCount: 0 };
        this.concurrencyNumber = process.env.CONCURRENCY_NUMBER || 10;
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
    handler(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // create temp directory with cache directory inside to download files from s3 and upload it to ADL.
            // In the end of the run the cache directory will be deleted.
            filesHelper_1.createDirIfNotExists(null, null, this.tempFolder);
            this.tempFolder += "/cache";
            filesHelper_1.createDirIfNotExists(null, null, this.tempFolder);
            const awsModule = new awsS3Module_1.AwsS3Module(this.awsBucketName, this.tempFolder, this.awsClient);
            const adlModule = new azureDataLakeModule_1.AzureDataLakeModule(this.azureAdlAccountName, this.tempFolder, this.adlClient, this.awsBucketName);
            const redisModule = this.useRedis ? new redisModule_1.RedisModule(this.initializeRedisClient(this.redisPort, this.redisHost), this.awsBucketName) : null;
            if (this.useRedis) {
                logger_1.winston.info("Using Redis");
            }
            else {
                logger_1.winston.info("Not using Redis");
            }
            yield this.batchIterationOverS3Items(awsModule, adlModule, redisModule);
            // After all uploads are completed, delete the cache directory and its sub directories.
            yield filesHelper_1.deleteFolder(this.tempFolder);
            logger_1.winston.info("all done");
            cb();
        });
    }
    /**
     *  Go over the items in S3 in batches of 1000.
     *  For each file in batch check if it is missing from ADL lake, if so download it to temp directory and upload to ADL.
     */
    batchIterationOverS3Items(awsS3Module, adlModule, redisModule) {
        return __awaiter(this, void 0, void 0, function* () {
            let awsObjectsOutput;
            let marker = "";
            this.copyProperties.batchNumber = 1;
            do {
                logger_1.winston.info(`Processing batch #${this.copyProperties.batchNumber}`);
                awsObjectsOutput = yield awsS3Module.listAllObjects(marker);
                if (awsObjectsOutput && awsObjectsOutput.Contents && awsObjectsOutput.Contents.length > 0) {
                    let awsObjects = awsObjectsOutput.Contents;
                    // Filter out the directories names - aws.listObjects returns all files in the bucket including directories names
                    awsObjects = awsObjects.filter((obj) => !obj.Key.endsWith("/"));
                    const promiseArray = awsObjects.map(key => {
                        return () => __awaiter(this, void 0, void 0, function* () {
                            try {
                                if (yield this.shouldUploadFile(redisModule, adlModule, key)) {
                                    yield awsS3Module.downloadFileFromS3(key);
                                    // Upload File if it doesn't exist in ADL or if a new version of the file exists in S3
                                    yield adlModule.uploadFileToAzureDataLake(key.Key);
                                    this.copyProperties.uploadedCount++;
                                    filesHelper_1.deleteFile(path.join(this.tempFolder, key.Key));
                                    // Update redis with the new file
                                    if (this.useRedis) {
                                        yield redisModule.addFileToRedis(key);
                                    }
                                }
                            }
                            catch (ex) {
                                logger_1.winston.error(`error was thrown while working on element ${key.Key} ${ex}`);
                            }
                        });
                    });
                    try {
                        yield parallel(promiseArray, this.concurrencyNumber);
                    }
                    catch (ex) {
                        logger_1.winston.error(ex);
                    }
                    marker = awsObjects[awsObjects.length - 1].Key;
                    this.copyProperties.batchNumber++;
                }
            } while (awsObjectsOutput.IsTruncated);
        });
    }
    shouldUploadFile(redisModule, adlModule, key) {
        return __awaiter(this, void 0, void 0, function* () {
            let shouldUploadFile;
            if (this.useRedis) {
                let obj = yield redisModule.isFileInRedis(key);
                if (obj === null) {
                    // Object is not in redis - check in ADL if it should be upload and update redis anyway
                    shouldUploadFile = yield adlModule.shouldUploadToADL(key);
                    // if file already exists in ADL, just update redis.
                    if (!shouldUploadFile) {
                        yield redisModule.addFileToRedis(key);
                    }
                }
                else {
                    // Check if file was modified since the last time it was uploaded
                    shouldUploadFile = obj.ETag !== key.ETag;
                }
            }
            else {
                shouldUploadFile = yield adlModule.shouldUploadToADL(key);
            }
            return shouldUploadFile;
        });
    }
    validateEnvironmentVariables() {
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
    initializeAwsClient(accessKeyId, secretAccessKey, region) {
        try {
            const config = { accessKeyId, secretAccessKey, region };
            return new AWS.S3(config);
        }
        catch (ex) {
            logger_1.winston.info(`error initializing s3 client: ${ex}`);
            throw ex;
        }
    }
    initializeAdlClient(clientId, domain, secret) {
        try {
            const credentials = new msrestAzure.ApplicationTokenCredentials(clientId, domain, secret);
            return new adlsManagement.DataLakeStoreFileSystemClient(credentials);
        }
        catch (ex) {
            logger_1.winston.error(`error initializing Azure client ${ex}`);
            throw ex;
        }
    }
    initializeRedisClient(port, host) {
        try {
            return redis.createClient(port, host);
        }
        catch (ex) {
            logger_1.winston.error(`error initializing redis client ${ex}`);
            throw ex;
        }
    }
}
exports.S3ToAdlDataCopy = S3ToAdlDataCopy;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QU0sRUFBRSxDQUFDO1FBQ1gsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXZMRCwwQ0F1TEMiLCJmaWxlIjoic3JjL3MzVG9BZGxEYXRhQ29weS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzeW5jIGZyb20gXCJhc3luY1wiO1xyXG5pbXBvcnQgKiBhcyBwYXJhbGxlbCBmcm9tIFwiYXN5bmMtYXdhaXQtcGFyYWxsZWxcIjtcclxuaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XHJcbmltcG9ydCAqIGFzIGFkbHNNYW5hZ2VtZW50IGZyb20gXCJhenVyZS1hcm0tZGF0YWxha2Utc3RvcmVcIjtcclxuaW1wb3J0ICogYXMgbXNyZXN0QXp1cmUgZnJvbSBcIm1zLXJlc3QtYXp1cmVcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgKiBhcyByZWRpcyBmcm9tIFwicmVkaXNcIjtcclxuaW1wb3J0IHsgQXdzUzNNb2R1bGUgfSBmcm9tIFwiLi9hd3NTM01vZHVsZVwiO1xyXG5pbXBvcnQgeyBBenVyZURhdGFMYWtlTW9kdWxlIH0gZnJvbSBcIi4vYXp1cmVEYXRhTGFrZU1vZHVsZVwiO1xyXG5pbXBvcnQgeyBjcmVhdGVEaXJJZk5vdEV4aXN0cywgZGVsZXRlRmlsZSwgZGVsZXRlRm9sZGVyLCBnZXREaXJlY3Rvcmllc1BhdGhBcnJheSB9IGZyb20gXCIuL2ZpbGVzSGVscGVyXCI7XHJcbmltcG9ydCB7IHdpbnN0b24gfSBmcm9tIFwiLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgUmVkaXNNb2R1bGUsIFJlZGlzT2JqZWN0IH0gZnJvbSBcIi4vcmVkaXNNb2R1bGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTM1RvQWRsRGF0YUNvcHkge1xyXG4gIHB1YmxpYyBhd3NDbGllbnQ6IEFXUy5TMztcclxuICBwdWJsaWMgYWRsQ2xpZW50OiBhZGxzTWFuYWdlbWVudC5EYXRhTGFrZVN0b3JlRmlsZVN5c3RlbUNsaWVudDtcclxuICBwdWJsaWMgYXdzQnVja2V0TmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyBhenVyZUFkbEFjY291bnROYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzOiB7IGJhdGNoTnVtYmVyOiBudW1iZXIsIHVwbG9hZGVkQ291bnQ6IDAgfSA9IHsgYmF0Y2hOdW1iZXI6IDAsIHVwbG9hZGVkQ291bnQ6IDAgfTtcclxuXHJcbiAgcHJpdmF0ZSBjb25jdXJyZW5jeU51bWJlciA9IHByb2Nlc3MuZW52LkNPTkNVUlJFTkNZX05VTUJFUiB8fCAxMDtcclxuICBwcml2YXRlIHRlbXBGb2xkZXI6IHN0cmluZztcclxuICBwcml2YXRlIGF3c0FjY2Vzc0tleUlkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBhd3NBY2Nlc3NTZWNyZXRLZXk6IHN0cmluZztcclxuICBwcml2YXRlIGF3c1JlZ2lvbjogc3RyaW5nO1xyXG4gIHByaXZhdGUgYXp1cmVDbGllbnRJZDogc3RyaW5nO1xyXG4gIHByaXZhdGUgYXp1cmVEb21haW46IHN0cmluZztcclxuICBwcml2YXRlIGF6dXJlU2VjcmV0OiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSB1c2VSZWRpczogYm9vbGVhbjtcclxuICBwcml2YXRlIHJlZGlzUG9ydDogc3RyaW5nO1xyXG4gIHByaXZhdGUgcmVkaXNIb3N0OiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy52YWxpZGF0ZUVudmlyb25tZW50VmFyaWFibGVzKCk7XHJcblxyXG4gICAgdGhpcy50ZW1wRm9sZGVyID0gcHJvY2Vzcy5lbnYuVEVNUF9GT0xERVI7XHJcbiAgICB0aGlzLmF3c0FjY2Vzc0tleUlkID0gcHJvY2Vzcy5lbnYuQVdTX0FDQ0VTU19LRVlfSUQ7XHJcbiAgICB0aGlzLmF3c0FjY2Vzc1NlY3JldEtleSA9IHByb2Nlc3MuZW52LkFXU19TRUNSRVRfQUNDRVNTX0tFWTtcclxuICAgIHRoaXMuYXdzUmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTjtcclxuICAgIHRoaXMuYXdzQnVja2V0TmFtZSA9IHByb2Nlc3MuZW52LkFXU19CVUNLRVRfTkFNRTtcclxuICAgIHRoaXMuYXp1cmVBZGxBY2NvdW50TmFtZSA9IHByb2Nlc3MuZW52LkFaVVJFX0FETF9BQ0NPVU5UX05BTUU7XHJcbiAgICB0aGlzLmF6dXJlQ2xpZW50SWQgPSBwcm9jZXNzLmVudi5BWlVSRV9DTElFTlRfSUQ7XHJcbiAgICB0aGlzLmF6dXJlRG9tYWluID0gcHJvY2Vzcy5lbnYuQVpVUkVfRE9NQUlOO1xyXG4gICAgdGhpcy5henVyZVNlY3JldCA9IHByb2Nlc3MuZW52LkFaVVJFX1NFQ1JFVDtcclxuICAgIHRoaXMudXNlUmVkaXMgPSBwcm9jZXNzLmVudi5VU0VfUkVESVMgIT09IHVuZGVmaW5lZCA/IHByb2Nlc3MuZW52W1wiVVNFX1JFRElTXCJdLnRvTG93ZXJDYXNlKCkgPT09IFwidHJ1ZVwiIDogZmFsc2U7XHJcbiAgICB0aGlzLnJlZGlzUG9ydCA9IHByb2Nlc3MuZW52LlJFRElTX1BPUlQgfHwgXCI2Mzc5XCI7XHJcbiAgICB0aGlzLnJlZGlzSG9zdCA9IHByb2Nlc3MuZW52LlJFRElTX0hPU1QgfHwgXCJyZWRpc1wiO1xyXG4gICAgLy8gSW5pdGlhbGl6ZSBjbGllbnRzXHJcbiAgICB0aGlzLmF3c0NsaWVudCA9IHRoaXMuaW5pdGlhbGl6ZUF3c0NsaWVudCh0aGlzLmF3c0FjY2Vzc0tleUlkLCB0aGlzLmF3c0FjY2Vzc1NlY3JldEtleSwgdGhpcy5hd3NSZWdpb24pO1xyXG4gICAgdGhpcy5hZGxDbGllbnQgPSB0aGlzLmluaXRpYWxpemVBZGxDbGllbnQodGhpcy5henVyZUNsaWVudElkLCB0aGlzLmF6dXJlRG9tYWluLCB0aGlzLmF6dXJlU2VjcmV0KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBoYW5kbGVyKGNiKSB7XHJcbiAgICAvLyBjcmVhdGUgdGVtcCBkaXJlY3Rvcnkgd2l0aCBjYWNoZSBkaXJlY3RvcnkgaW5zaWRlIHRvIGRvd25sb2FkIGZpbGVzIGZyb20gczMgYW5kIHVwbG9hZCBpdCB0byBBREwuXHJcbiAgICAvLyBJbiB0aGUgZW5kIG9mIHRoZSBydW4gdGhlIGNhY2hlIGRpcmVjdG9yeSB3aWxsIGJlIGRlbGV0ZWQuXHJcbiAgICBjcmVhdGVEaXJJZk5vdEV4aXN0cyhudWxsLCBudWxsLCB0aGlzLnRlbXBGb2xkZXIpO1xyXG4gICAgdGhpcy50ZW1wRm9sZGVyICs9IFwiL2NhY2hlXCI7XHJcbiAgICBjcmVhdGVEaXJJZk5vdEV4aXN0cyhudWxsLCBudWxsLCB0aGlzLnRlbXBGb2xkZXIpO1xyXG5cclxuICAgIGNvbnN0IGF3c01vZHVsZSA9IG5ldyBBd3NTM01vZHVsZSh0aGlzLmF3c0J1Y2tldE5hbWUsIHRoaXMudGVtcEZvbGRlciwgdGhpcy5hd3NDbGllbnQpO1xyXG4gICAgY29uc3QgYWRsTW9kdWxlID0gbmV3IEF6dXJlRGF0YUxha2VNb2R1bGUodGhpcy5henVyZUFkbEFjY291bnROYW1lLCB0aGlzLnRlbXBGb2xkZXIsIHRoaXMuYWRsQ2xpZW50LCB0aGlzLmF3c0J1Y2tldE5hbWUpO1xyXG4gICAgY29uc3QgcmVkaXNNb2R1bGUgPSB0aGlzLnVzZVJlZGlzID8gbmV3IFJlZGlzTW9kdWxlKHRoaXMuaW5pdGlhbGl6ZVJlZGlzQ2xpZW50KHRoaXMucmVkaXNQb3J0LCB0aGlzLnJlZGlzSG9zdCksIHRoaXMuYXdzQnVja2V0TmFtZSkgOiBudWxsO1xyXG5cclxuICAgIGlmICh0aGlzLnVzZVJlZGlzKSB7XHJcbiAgICAgIHdpbnN0b24uaW5mbyhcIlVzaW5nIFJlZGlzXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2luc3Rvbi5pbmZvKFwiTm90IHVzaW5nIFJlZGlzXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHRoaXMuYmF0Y2hJdGVyYXRpb25PdmVyUzNJdGVtcyhhd3NNb2R1bGUsIGFkbE1vZHVsZSwgcmVkaXNNb2R1bGUpO1xyXG5cclxuICAgIC8vIEFmdGVyIGFsbCB1cGxvYWRzIGFyZSBjb21wbGV0ZWQsIGRlbGV0ZSB0aGUgY2FjaGUgZGlyZWN0b3J5IGFuZCBpdHMgc3ViIGRpcmVjdG9yaWVzLlxyXG4gICAgYXdhaXQgZGVsZXRlRm9sZGVyKHRoaXMudGVtcEZvbGRlcik7XHJcbiAgICB3aW5zdG9uLmluZm8oXCJhbGwgZG9uZVwiKTtcclxuICAgIGNiKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAgR28gb3ZlciB0aGUgaXRlbXMgaW4gUzMgaW4gYmF0Y2hlcyBvZiAxMDAwLlxyXG4gICAqICBGb3IgZWFjaCBmaWxlIGluIGJhdGNoIGNoZWNrIGlmIGl0IGlzIG1pc3NpbmcgZnJvbSBBREwgbGFrZSwgaWYgc28gZG93bmxvYWQgaXQgdG8gdGVtcCBkaXJlY3RvcnkgYW5kIHVwbG9hZCB0byBBREwuXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIGJhdGNoSXRlcmF0aW9uT3ZlclMzSXRlbXMoYXdzUzNNb2R1bGU6IEF3c1MzTW9kdWxlLCBhZGxNb2R1bGU6IEF6dXJlRGF0YUxha2VNb2R1bGUsIHJlZGlzTW9kdWxlOiBSZWRpc01vZHVsZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgbGV0IGF3c09iamVjdHNPdXRwdXQ6IEFXUy5TMy5MaXN0T2JqZWN0c091dHB1dDtcclxuICAgIGxldCBtYXJrZXIgPSBcIlwiO1xyXG4gICAgdGhpcy5jb3B5UHJvcGVydGllcy5iYXRjaE51bWJlciA9IDE7XHJcblxyXG4gICAgZG8ge1xyXG4gICAgICB3aW5zdG9uLmluZm8oYFByb2Nlc3NpbmcgYmF0Y2ggIyR7dGhpcy5jb3B5UHJvcGVydGllcy5iYXRjaE51bWJlcn1gKTtcclxuICAgICAgYXdzT2JqZWN0c091dHB1dCA9IGF3YWl0IGF3c1MzTW9kdWxlLmxpc3RBbGxPYmplY3RzKG1hcmtlcik7XHJcblxyXG4gICAgICBpZiAoYXdzT2JqZWN0c091dHB1dCAmJiBhd3NPYmplY3RzT3V0cHV0LkNvbnRlbnRzICYmIGF3c09iamVjdHNPdXRwdXQuQ29udGVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGxldCBhd3NPYmplY3RzID0gYXdzT2JqZWN0c091dHB1dC5Db250ZW50cztcclxuICAgICAgICAvLyBGaWx0ZXIgb3V0IHRoZSBkaXJlY3RvcmllcyBuYW1lcyAtIGF3cy5saXN0T2JqZWN0cyByZXR1cm5zIGFsbCBmaWxlcyBpbiB0aGUgYnVja2V0IGluY2x1ZGluZyBkaXJlY3RvcmllcyBuYW1lc1xyXG4gICAgICAgIGF3c09iamVjdHMgPSBhd3NPYmplY3RzLmZpbHRlcigob2JqKSA9PiAhb2JqLktleS5lbmRzV2l0aChcIi9cIikpO1xyXG5cclxuICAgICAgICBjb25zdCBwcm9taXNlQXJyYXkgPSBhd3NPYmplY3RzLm1hcChrZXkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5zaG91bGRVcGxvYWRGaWxlKHJlZGlzTW9kdWxlLCBhZGxNb2R1bGUsIGtleSkpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGF3c1MzTW9kdWxlLmRvd25sb2FkRmlsZUZyb21TMyhrZXkpO1xyXG4gICAgICAgICAgICAgICAgLy8gVXBsb2FkIEZpbGUgaWYgaXQgZG9lc24ndCBleGlzdCBpbiBBREwgb3IgaWYgYSBuZXcgdmVyc2lvbiBvZiB0aGUgZmlsZSBleGlzdHMgaW4gUzNcclxuICAgICAgICAgICAgICAgIGF3YWl0IGFkbE1vZHVsZS51cGxvYWRGaWxlVG9BenVyZURhdGFMYWtlKGtleS5LZXkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3B5UHJvcGVydGllcy51cGxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICBkZWxldGVGaWxlKHBhdGguam9pbih0aGlzLnRlbXBGb2xkZXIsIGtleS5LZXkpKTtcclxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSByZWRpcyB3aXRoIHRoZSBuZXcgZmlsZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXNlUmVkaXMpIHtcclxuICAgICAgICAgICAgICAgICAgYXdhaXQgcmVkaXNNb2R1bGUuYWRkRmlsZVRvUmVkaXMoa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgd2luc3Rvbi5lcnJvcihgZXJyb3Igd2FzIHRocm93biB3aGlsZSB3b3JraW5nIG9uIGVsZW1lbnQgJHtrZXkuS2V5fSAke2V4fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgcGFyYWxsZWwocHJvbWlzZUFycmF5LCB0aGlzLmNvbmN1cnJlbmN5TnVtYmVyKTtcclxuICAgICAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICAgICAgd2luc3Rvbi5lcnJvcihleCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXJrZXIgPSBhd3NPYmplY3RzW2F3c09iamVjdHMubGVuZ3RoIC0gMV0uS2V5O1xyXG4gICAgICAgIHRoaXMuY29weVByb3BlcnRpZXMuYmF0Y2hOdW1iZXIrKztcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoYXdzT2JqZWN0c091dHB1dC5Jc1RydW5jYXRlZCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2hvdWxkVXBsb2FkRmlsZShyZWRpc01vZHVsZTogUmVkaXNNb2R1bGUsIGFkbE1vZHVsZTogQXp1cmVEYXRhTGFrZU1vZHVsZSwga2V5OiBBV1MuUzMuT2JqZWN0KSB7XHJcbiAgICBsZXQgc2hvdWxkVXBsb2FkRmlsZTogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMudXNlUmVkaXMpIHtcclxuICAgICAgbGV0IG9iajogUmVkaXNPYmplY3QgPSBhd2FpdCByZWRpc01vZHVsZS5pc0ZpbGVJblJlZGlzKGtleSk7XHJcbiAgICAgIGlmIChvYmogPT09IG51bGwpIHtcclxuICAgICAgICAvLyBPYmplY3QgaXMgbm90IGluIHJlZGlzIC0gY2hlY2sgaW4gQURMIGlmIGl0IHNob3VsZCBiZSB1cGxvYWQgYW5kIHVwZGF0ZSByZWRpcyBhbnl3YXlcclxuICAgICAgICBzaG91bGRVcGxvYWRGaWxlID0gYXdhaXQgYWRsTW9kdWxlLnNob3VsZFVwbG9hZFRvQURMKGtleSk7XHJcbiAgICAgICAgLy8gaWYgZmlsZSBhbHJlYWR5IGV4aXN0cyBpbiBBREwsIGp1c3QgdXBkYXRlIHJlZGlzLlxyXG4gICAgICAgIGlmICghc2hvdWxkVXBsb2FkRmlsZSkge1xyXG4gICAgICAgICAgYXdhaXQgcmVkaXNNb2R1bGUuYWRkRmlsZVRvUmVkaXMoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSB3YXMgbW9kaWZpZWQgc2luY2UgdGhlIGxhc3QgdGltZSBpdCB3YXMgdXBsb2FkZWRcclxuICAgICAgICBzaG91bGRVcGxvYWRGaWxlID0gb2JqLkVUYWcgIT09IGtleS5FVGFnO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzaG91bGRVcGxvYWRGaWxlID0gYXdhaXQgYWRsTW9kdWxlLnNob3VsZFVwbG9hZFRvQURMKGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNob3VsZFVwbG9hZEZpbGU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZhbGlkYXRlRW52aXJvbm1lbnRWYXJpYWJsZXMoKSB7XHJcbiAgICBjb25zdCB2YXJpYWJsZXNMaXN0ID0gW1wiQVdTX0FDQ0VTU19LRVlfSURcIiwgXCJBV1NfU0VDUkVUX0FDQ0VTU19LRVlcIiwgXCJBV1NfUkVHSU9OXCIsIFwiQVdTX0JVQ0tFVF9OQU1FXCIsXHJcbiAgICAgIFwiQVpVUkVfQ0xJRU5UX0lEXCIsIFwiQVpVUkVfRE9NQUlOXCIsIFwiQVpVUkVfU0VDUkVUXCIsIFwiQVpVUkVfQURMX0FDQ09VTlRfTkFNRVwiLCBcIlRFTVBfRk9MREVSXCJdO1xyXG5cclxuICAgIHZhcmlhYmxlc0xpc3QuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcclxuICAgICAgaWYgKCFwcm9jZXNzLmVudlt2YXJpYWJsZV0pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVudmlyb25tZW50IFZhcmlhYmxlICR7dmFyaWFibGV9IGlzIG5vdCBkZWZpbmVkYCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChwcm9jZXNzLmVudltcIlVTRV9SRURJU1wiXSkge1xyXG4gICAgICBpZiAocHJvY2Vzcy5lbnZbXCJVU0VfUkVESVNcIl0udG9Mb3dlckNhc2UoKSAhPT0gXCJ0cnVlXCIgJiYgcHJvY2Vzcy5lbnZbXCJVU0VfUkVESVNcIl0udG9Mb3dlckNhc2UoKSAhPT0gXCJmYWxzZVwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnZpcm9ubWVudCBWYXJpYWJsZSBVU0VfUkVESVMgc2hvdWxkIGNvbnRhaW4gYm9vbGVhbiB2YWx1ZWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplQXdzQ2xpZW50KGFjY2Vzc0tleUlkOiBzdHJpbmcsIHNlY3JldEFjY2Vzc0tleTogc3RyaW5nLCByZWdpb246IHN0cmluZyk6IEFXUy5TMyB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB7IGFjY2Vzc0tleUlkLCBzZWNyZXRBY2Nlc3NLZXksIHJlZ2lvbiB9O1xyXG4gICAgICByZXR1cm4gbmV3IEFXUy5TMyhjb25maWcpO1xyXG4gICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgd2luc3Rvbi5pbmZvKGBlcnJvciBpbml0aWFsaXppbmcgczMgY2xpZW50OiAke2V4fWApO1xyXG4gICAgICB0aHJvdyBleDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUFkbENsaWVudChjbGllbnRJZDogc3RyaW5nLCBkb21haW46IHN0cmluZywgc2VjcmV0OiBzdHJpbmcpOiBhZGxzTWFuYWdlbWVudC5EYXRhTGFrZVN0b3JlRmlsZVN5c3RlbUNsaWVudCB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjcmVkZW50aWFscyA9IG5ldyBtc3Jlc3RBenVyZS5BcHBsaWNhdGlvblRva2VuQ3JlZGVudGlhbHMoY2xpZW50SWQsIGRvbWFpbiwgc2VjcmV0KTtcclxuICAgICAgcmV0dXJuIG5ldyBhZGxzTWFuYWdlbWVudC5EYXRhTGFrZVN0b3JlRmlsZVN5c3RlbUNsaWVudChjcmVkZW50aWFscyk7XHJcbiAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICB3aW5zdG9uLmVycm9yKGBlcnJvciBpbml0aWFsaXppbmcgQXp1cmUgY2xpZW50ICR7ZXh9YCk7XHJcbiAgICAgIHRocm93IGV4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVSZWRpc0NsaWVudChwb3J0OiBzdHJpbmcsIGhvc3Q6IHN0cmluZyk6IHJlZGlzLmNsaWVudCB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gcmVkaXMuY3JlYXRlQ2xpZW50KHBvcnQsIGhvc3QpO1xyXG4gICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgd2luc3Rvbi5lcnJvcihgZXJyb3IgaW5pdGlhbGl6aW5nIHJlZGlzIGNsaWVudCAke2V4fWApO1xyXG4gICAgICB0aHJvdyBleDtcclxuICAgIH1cclxuICB9XHJcbn0iXSwic291cmNlUm9vdCI6Ii4uIn0=
