import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as AWSMock from "mock-aws-s3";
import * as sinon from "sinon";
import { AwsS3Module } from "../src/awsS3Module";
import { createDirIfNotExists, deleteFolder } from "../src/filesHelper";

describe("aws s3 tests", () => {
  let awsS3Module: AwsS3Module;

  const bucketName = "bucket";
  const tempFolder = "tempFolder";
  const fileContent = "some data 123";
  const awsFileTemp = "bucket/newfile.txt";
  const newFilePath = "./tempFolder/newfile.txt";

  AWSMock.config.basePath = "./";
  let s3 = AWSMock.S3({
    params: {
      Bucket: bucketName,
      Delimiter: "/",
    },
  });

  it("downloadFileFromS3 downloads the file to local folder successfully", async () => {
    // given
    createDirIfNotExists("./", bucketName);
    createDirIfNotExists("./", tempFolder);
    fs.appendFile(awsFileTemp, fileContent, err => {
      expect(err).to.equal(null);
    });

    // act
    awsS3Module = new AwsS3Module(bucketName, tempFolder, s3);
    let result = await awsS3Module.downloadFileFromS3({ Key: "newfile.txt" });

    // verify file is downloaded and it"s content
    return new Promise((resolve) => {
      fs.readFile(newFilePath, "utf8", (err, data) => {
        expect(fileContent).to.deep.equal(data);
        expect(err).to.equal(null);

        // delete files and folders
        try {
          deleteFolder(bucketName);
          deleteFolder(tempFolder);
        } catch (ex) {
          console.log(`exception thrown while deleting files and folders: ${ex}`);
        }
      });
      resolve();
    });
  });

  it("downloadFileFromS3 rejects request when file doesn't exists", async () => {
    // given
    createDirIfNotExists("./", tempFolder);

    // act
    awsS3Module = new AwsS3Module(bucketName, tempFolder, s3);

    let result = await awsS3Module.downloadFileFromS3({ Key: "newfile.txt" }).catch((err) => {
      // verify
      expect(err.code).to.equal("ENOENT");
      // delete files and folders
      deleteFolder(tempFolder);
    });
  });
});
