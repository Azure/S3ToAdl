import * as AWS from "aws-sdk";
import * as redis from "redis";
import { winston } from "./logger";


export class RedisModule {

    private redisClient;
    private bucketName: string;

    constructor(redisClient: redis.client, bucketName: string) {
        this.redisClient = redisClient;
        this.bucketName = bucketName;
    }

    public async isFileInRedis(awsFile: AWS.S3.Object): Promise<RedisObject> {
        return await new Promise<RedisObject>((resolve, reject) => {
            const fileName = this.bucketName + "/" + awsFile.Key;
            this.redisClient.get(fileName, function (err, value) {
                if (value === null) {
                    winston.verbose(`file ${fileName} not found in redis`);
                    resolve(null);
                }
                if (value) {
                    winston.verbose(`file ${fileName} was found in redis`);
                    resolve(JSON.parse(value));
                }
                if (err) {
                    reject(err);
                }
            });
        });
    }

    public async addFileToRedis(awsFile: AWS.S3.Object) {
        return await new Promise((resolve, reject) => {
            const elementToUpload = {
                LastModified: awsFile.LastModified,
                ETag: awsFile.ETag,
                Size: awsFile.Size,
                Owner: awsFile.Owner,
                StorageClass: awsFile.StorageClass,

            };
            const stringifyElement = JSON.stringify(elementToUpload);
            const fileName = this.bucketName + "/" + awsFile.Key;
            this.redisClient.set(fileName, stringifyElement, (err) => {
                if (err) {
                    reject(err);
                }

                winston.verbose(`Added file ${fileName} successfully to redis`);
                resolve();
            });
        });
    }
}

export class RedisObject {
    LastModified: Date;
    ETag: string;
    Size: number;
    Owner: string;
    StorageClass: string;
}