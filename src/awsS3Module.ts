import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { createDirIfNotExists, getDirectoriesPathArray } from "./filesHelper";
import { winston } from "./logger";

export class AwsS3Module {
    public s3Client: AWS.S3;
    private bucketName: string;
    private tempFolder: string;

    constructor(bucketName: string, tempFolder: string, s3Client: AWS.S3) {
        this.bucketName = bucketName;
        this.tempFolder = tempFolder;
        this.s3Client = s3Client;
    }

    /**
     * Get a list of all files in S3 bucket - including sub directories gets 1000 at a time.
     * @param marker - Indicates the start point of the list object.
     */
    public async listAllObjects(marker?: string): Promise<AWS.S3.ListObjectsOutput> {
        return await new Promise<AWS.S3.ListObjectsOutput>((resolve, reject) => {
            this.s3Client.listObjects({ Bucket: this.bucketName, Marker: marker, MaxKeys: 1000 }, (error, data) => {
                if (error) {
                    return reject(error);
                }

                return resolve(data);
            });
        });
    }

    /**
     * Download file from S3 to local directory
     * @param awsFile - the file to download from s3
     */
    public async downloadFileFromS3(awsFile: AWS.S3.Object): Promise<void> {
        if (!awsFile || !awsFile.Key) {
            winston.error("aws file is undefined");
            return;
        }

        const params = { Bucket: this.bucketName, Key: awsFile.Key };
        const directoriesList = getDirectoriesPathArray(awsFile.Key);

        let fullPath = this.tempFolder;
        directoriesList.forEach(dir => {
            createDirIfNotExists(fullPath, dir);
            fullPath += "/" + dir;
        });

        const file = fs.createWriteStream(path.join(this.tempFolder, awsFile.Key));
        winston.info(`Downloading ${awsFile.Key} from S3`);
        await new Promise((resolve, reject) => {
            this.s3Client.getObject(params).createReadStream()
                .on("end", () => resolve())
                .on("error", error => reject(error))
                .pipe(file);
        });
    }
}
