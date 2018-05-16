import * as AWS from "aws-sdk";
import * as adlsManagement from "azure-arm-datalake-store";
import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as AWSMock from "mock-aws-s3";
import * as msrestAzure from "ms-rest-azure";
import * as sinon from "sinon";
import { AwsS3Module } from "../src/awsS3Module";
import { AzureDataLakeModule } from "../src/azureDataLakeModule";
import { createDirIfNotExists, deleteFolder } from "../src/filesHelper";
import { RedisModule, RedisObject } from "../src/redisModule";
import { S3ToAdlDataCopy } from "../src/s3ToAdlDataCopy";

describe("aws s3 tests", () => {

    let s3ToAdl: S3ToAdlDataCopy;
    let adlModule: AzureDataLakeModule;
    let awsS3Module: AwsS3Module;
    let redisModule: RedisModule;

    const expectedElement1 = {
        ETag: "123456",
        Key: "file1",
    };
    const expectedElement2 = {
        ETag: "123457",
        Key: "file2",
    };

    beforeEach(function () {
        process.env["AWS_ACCESS_KEY_ID"] = "key";
        process.env["AWS_SECRET_ACCESS_KEY"] = "secretkey";
        process.env["AWS_REGION"] = "region";
        process.env["AWS_BUCKET_NAME"] = "bucket";
        process.env["AZURE_CLIENT_ID"] = "client";
        process.env["AZURE_DOMAIN"] = "domain";
        process.env["AZURE_SECRET"] = "secret";
        process.env["AZURE_ADL_ACCOUNT_NAME"] = "account";
        process.env["TEMP_FOLDER"] = "./tempFolder";
        process.env["USE_REDIS"] = "false";

        const bucketName = "bucket";
        const tempFolder = "tempFolder";
        awsS3Module = new AwsS3Module(bucketName, tempFolder, new AWS.S3());
        adlModule = new AzureDataLakeModule("accountName", "folderName", null, "bucket");
    });

    it("When required environment variables are missing exception is thrown", () => {
        // given
        delete process.env["AZURE_ADL_ACCOUNT_NAME"];

        // act
        try {
            s3ToAdl = new S3ToAdlDataCopy();
        } catch (ex) {
            // assert
            expect(ex.message).to.equal("Environment Variable AZURE_ADL_ACCOUNT_NAME is not defined");
        }
    });

    it("When USE_REDIS is set to other variable then true/false exception is thrown", () => {
        // given
        process.env["USE_REDIS"] = "some value";

        // act
        try {
            s3ToAdl = new S3ToAdlDataCopy();
        } catch (ex) {
            // assert
            expect(ex.message).to.equal("Environment Variable USE_REDIS should contain boolean value");
        }
    });

    it("batchIterationOverS3Items doesn't uploads file when it's already exists", async () => {
        // given
        sinon.stub(awsS3Module, "listAllObjects").returns({
            Contents: [expectedElement1, expectedElement2],
        });

        const uploadToAdlStub = sinon.stub(adlModule, "shouldUploadToADL").returns(new Promise<boolean>((resolve) => {
            resolve(false);
        }));

        const awsSpy = sinon.spy(awsS3Module, "downloadFileFromS3");

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        await s3ToAdl.batchIterationOverS3Items(awsS3Module, adlModule, null);

        // assert
        expect(awsSpy.callCount).to.equal(0);
        expect(uploadToAdlStub.callCount).to.equal(2);
    });

    it("batchIterationOverS3Items uploads the missing file in ADL", async () => {
        // given
        sinon.stub(awsS3Module, "listAllObjects").returns({
            Contents: [expectedElement1, expectedElement2],
        });
        let downloadStub = sinon.stub(awsS3Module, "downloadFileFromS3").returns(new Promise((resolve) => resolve()));
        sinon.stub(adlModule, "uploadFileToAzureDataLake").returns(new Promise((resolve) => resolve()));

        const uploadStub = sinon.stub(adlModule, "shouldUploadToADL");
        uploadStub.withArgs(expectedElement1).returns(new Promise<boolean>((resolve) => {
            resolve(false);
        }));
        uploadStub.withArgs(expectedElement2).returns(new Promise<boolean>((resolve) => {
            resolve(true);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        await s3ToAdl.batchIterationOverS3Items(awsS3Module, adlModule, null);

        // assert
        expect(downloadStub.callCount).to.equal(1);
        expect(uploadStub.callCount).to.equal(2);
    });

    it("batchIterationOverS3Items when error is thrown while uploading file iteration continues as expected", async () => {
        // given
        sinon.stub(awsS3Module, "listAllObjects").returns({
            Contents: [expectedElement1, expectedElement2],
        });

        let downloadStub = sinon.stub(awsS3Module, "downloadFileFromS3").returns(new Promise((resolve) => resolve()));
        let uploadStub = sinon.stub(adlModule, "uploadFileToAzureDataLake");
        uploadStub.withArgs(expectedElement1.Key).throws(new Error());
        uploadStub.withArgs(expectedElement2.Key).returns(new Promise((resolve) => resolve()));

        const shouldUploadStub = sinon.stub(adlModule, "shouldUploadToADL").returns(new Promise<boolean>((resolve) => {
            resolve(true);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        await s3ToAdl.batchIterationOverS3Items(awsS3Module, adlModule, null);

        // assert
        expect(downloadStub.callCount).to.equal(2);
        expect(shouldUploadStub.callCount).to.equal(2);
        // expect only one since the second thrown an error
        expect(s3ToAdl.copyProperties.uploadedCount).to.equal(1);
    });

    it("shouldUploadFile return false when using redis and file exist on ADL", async () => {
        // given
        process.env["USE_REDIS"] = "true";
        const redisObj = new RedisObject();
        redisObj.ETag = expectedElement1.ETag;
        redisModule = new RedisModule(null, "bucket");
        const shouldUploadStub = sinon.stub(redisModule, "isFileInRedis").returns(new Promise<RedisObject>((resolve) => {
            resolve(redisObj);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        let shouldUpload = await s3ToAdl.shouldUploadFile(redisModule, adlModule, expectedElement1);

        // assert
        expect(shouldUploadStub.callCount).to.equal(1);
        // expect only one since the second thrown an error
        expect(shouldUpload).to.equal(false);
    });

    it("shouldUploadFile return true when using redis and file is missing from ADL", async () => {
        // given
        process.env["USE_REDIS"] = "true";
        const redisObj = new RedisObject();
        redisObj.ETag = "6543321";
        redisModule = new RedisModule(null, "bucket");
        const shouldUploadStub = sinon.stub(redisModule, "isFileInRedis").returns(new Promise<RedisObject>((resolve) => {
            resolve(redisObj);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        let shouldUpload = await s3ToAdl.shouldUploadFile(redisModule, adlModule, expectedElement1);

        // assert
        expect(shouldUploadStub.callCount).to.equal(1);
        // expect only one since the second thrown an error
        expect(shouldUpload).to.equal(true);
    });

    it("shouldUploadFile return true and not update redis when redis is empty and file exist on ADL", async () => {
        // given
        process.env["USE_REDIS"] = "true";
        redisModule = new RedisModule(null, "bucket");
        const isFileInRedisStub = sinon.stub(redisModule, "isFileInRedis").returns(new Promise<RedisObject>((resolve) => {
            resolve(null);
        }));

        const addFileToRedisStub = sinon.stub(redisModule, "addFileToRedis").returns(new Promise<RedisObject>((resolve) => {
            resolve();
        }));
        const uploadToAdlStub = sinon.stub(adlModule, "shouldUploadToADL").returns(new Promise<boolean>((resolve) => {
            resolve(false);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        let shouldUpload = await s3ToAdl.shouldUploadFile(redisModule, adlModule, expectedElement1);

        // assert
        expect(isFileInRedisStub.callCount).to.equal(1);
        expect(shouldUpload).to.equal(false);
        expect(addFileToRedisStub.callCount).to.equal(1);
    });

    it("shouldUploadFile return true and update redis when redis is empty and file exist on ADL", async () => {
        // given
        process.env["USE_REDIS"] = "true";
        redisModule = new RedisModule(null, "bucket");
        const isFileInRedisStub = sinon.stub(redisModule, "isFileInRedis").returns(new Promise<RedisObject>((resolve) => {
            resolve(null);
        }));

        const addFileToRedisStub = sinon.stub(redisModule, "addFileToRedis");
        const uploadToAdlStub = sinon.stub(adlModule, "shouldUploadToADL").returns(new Promise<boolean>((resolve) => {
            resolve(true);
        }));

        // act
        s3ToAdl = new S3ToAdlDataCopy();
        let shouldUpload = await s3ToAdl.shouldUploadFile(redisModule, adlModule, expectedElement1);

        // assert
        expect(isFileInRedisStub.callCount).to.equal(1);
        expect(shouldUpload).to.equal(true);
        expect(addFileToRedisStub.callCount).to.equal(0);
    });
});