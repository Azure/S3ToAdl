import * as AWS from "aws-sdk";
import * as adlsManagement from "azure-arm-datalake-store";
import { expect } from "chai";
import "mocha";
import * as msrestAzure from "ms-rest-azure";
import * as sinon from "sinon";
import { AzureDataLakeModule } from "../src/azureDataLakeModule";

describe("shouldUploadToADL tests", () => {
    let adlClient: adlsManagement.DataLakeStoreFileSystemClient;
    let adlModule: AzureDataLakeModule;

    beforeEach(function () {
        const credentials = new msrestAzure.ApplicationTokenCredentials("someclient", "domain", "secret");
        adlClient = new adlsManagement.DataLakeStoreFileSystemClient(credentials);
    });

    it("shouldUploadToADL returns true when adl file is old", async () => {
        // given
        const expectedResult = {
            fileStatus: {
                modificationTime: new Date(2016, 1, 1).getTime(),
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").returns(expectedResult);
        adlModule = new AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");

        // Act
        const result = await adlModule.shouldUploadToADL({ LastModified: new Date(), Key: "key" });

        // Assert
        expect(result).to.equal(true);
    });

    it("shouldUploadToADL returns false when the file in s3 is not newer than the file in ADL", async () => {
        // given
        const expectedResult = {
            fileStatus: {
                modificationTime: new Date().getTime(),
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").returns(expectedResult);
        adlModule = new AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");

        // Act
        const result = await adlModule.shouldUploadToADL({ LastModified: new Date(2016, 1, 1), Key: "key" });

        // Assert
        expect(result).to.equal(false);
    });

    it("shouldUploadToADL returns true when file does not exist in adl", async () => {
        // given ex.body.remoteException.exception
        let fileNotFoundException = {
            body: {
                remoteException: {
                    exception: "FileNotFoundException",
                },
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").throws(fileNotFoundException);
        adlModule = new AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");

        // Act
        const result = await adlModule.shouldUploadToADL({ LastModified: new Date(), Key: "key" });

        // Assert
        expect(result).to.equal(true);
    });
});