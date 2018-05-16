import { S3ToAdlDataCopy } from "../src/s3ToAdlDataCopy";

async function E2EFlow() {
    // Validate all environment variables are set (validation is part of the ctor)
    const s3ToAdlDataCopy = new S3ToAdlDataCopy();
    const dummyFileName = "test1/tempFile.txt";
    const fileContent = "data 1234";

    // Upload dummy file to S3
    await new Promise<AWS.S3.ListObjectsOutput>((resolve, reject) => {
        s3ToAdlDataCopy.awsClient.putObject({
            Bucket: s3ToAdlDataCopy.awsBucketName,
            Key: dummyFileName,
            Body: fileContent,
        }, (err, data) => {
            if (err) {
                console.log(`Error uploading file to s3: ${err}`);
                reject(err);
            } else {
                console.log("Uploaded file to s3 successfully");
                resolve();
            }
        });
    });

    // Run flow to upload file to ADL
    await s3ToAdlDataCopy.handler(() => {
        console.log("completed");
    });

    // Verify the file exists in ADL and have the right content
    try {
        let status = await s3ToAdlDataCopy.adlClient.fileSystem.getFileStatus(s3ToAdlDataCopy.azureAdlAccountName, dummyFileName);
        if (status.fileStatus.length !== fileContent.length) {
            throw new Error("File doesn't have the expected content");
        } else {
            console.log("E2E worked as expected!");
        }
    } catch (ex) {
        console.log(`file doesn't exist in the expected location: ${ex}`);
    }
}

E2EFlow();