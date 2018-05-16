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
const chai_1 = require("chai");
const fs = require("fs");
require("mocha");
const AWSMock = require("mock-aws-s3");
const awsS3Module_1 = require("../src/awsS3Module");
const filesHelper_1 = require("../src/filesHelper");
describe("aws s3 tests", () => {
    let awsS3Module;
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
    it("downloadFileFromS3 downloads the file to local folder successfully", () => __awaiter(this, void 0, void 0, function* () {
        // given
        filesHelper_1.createDirIfNotExists("./", bucketName);
        filesHelper_1.createDirIfNotExists("./", tempFolder);
        fs.appendFile(awsFileTemp, fileContent, err => {
            chai_1.expect(err).to.equal(null);
        });
        // act
        awsS3Module = new awsS3Module_1.AwsS3Module(bucketName, tempFolder, s3);
        let result = yield awsS3Module.downloadFileFromS3({ Key: "newfile.txt" });
        // verify file is downloaded and it"s content
        return new Promise((resolve) => {
            fs.readFile(newFilePath, "utf8", (err, data) => {
                chai_1.expect(fileContent).to.deep.equal(data);
                chai_1.expect(err).to.equal(null);
                // delete files and folders
                try {
                    filesHelper_1.deleteFolder(bucketName);
                    filesHelper_1.deleteFolder(tempFolder);
                }
                catch (ex) {
                    console.log(`exception thrown while deleting files and folders: ${ex}`);
                }
            });
            resolve();
        });
    }));
    it("downloadFileFromS3 rejects request when file doesn't exists", () => __awaiter(this, void 0, void 0, function* () {
        // given
        filesHelper_1.createDirIfNotExists("./", tempFolder);
        // act
        awsS3Module = new awsS3Module_1.AwsS3Module(bucketName, tempFolder, s3);
        let result = yield awsS3Module.downloadFileFromS3({ Key: "newfile.txt" }).catch((err) => {
            // verify
            chai_1.expect(err.code).to.equal("ENOENT");
            // delete files and folders
            filesHelper_1.deleteFolder(tempFolder);
        });
    }));
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rlc3QvYXdzUzNNb2R1bGVUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwrQkFBOEI7QUFDOUIseUJBQXlCO0FBQ3pCLGlCQUFlO0FBQ2YsdUNBQXVDO0FBRXZDLG9EQUFpRDtBQUNqRCxvREFBd0U7QUFFeEUsUUFBUSxDQUFDLGNBQWMsRUFBRTtJQUN2QixJQUFJLFdBQXdCLENBQUM7SUFFN0IsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDO0lBQzVCLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7SUFDcEMsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsTUFBTSxXQUFXLEdBQUcsMEJBQTBCLENBQUM7SUFFL0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQy9CLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxFQUFFO1lBQ04sTUFBTSxFQUFFLFVBQVU7WUFDbEIsU0FBUyxFQUFFLEdBQUc7U0FDZjtLQUNGLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxvRUFBb0UsRUFBRTtRQUN2RSxRQUFRO1FBQ1Isa0NBQW9CLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLGtDQUFvQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2QyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRztZQUN6QyxhQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU07UUFDTixXQUFXLEdBQUcsSUFBSSx5QkFBVyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUUxRSw2Q0FBNkM7UUFDN0MsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTztZQUN6QixFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtnQkFDekMsYUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxhQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFM0IsMkJBQTJCO2dCQUMzQixJQUFJLENBQUM7b0JBQ0gsMEJBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDekIsMEJBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0RBQXNELEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDZEQUE2RCxFQUFFO1FBQ2hFLFFBQVE7UUFDUixrQ0FBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFdkMsTUFBTTtRQUNOLFdBQVcsR0FBRyxJQUFJLHlCQUFXLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUxRCxJQUFJLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUc7WUFDbEYsU0FBUztZQUNULGFBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwQywyQkFBMkI7WUFDM0IsMEJBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZXN0L2F3c1MzTW9kdWxlVGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCB9IGZyb20gXCJjaGFpXCI7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgXCJtb2NoYVwiO1xyXG5pbXBvcnQgKiBhcyBBV1NNb2NrIGZyb20gXCJtb2NrLWF3cy1zM1wiO1xyXG5pbXBvcnQgKiBhcyBzaW5vbiBmcm9tIFwic2lub25cIjtcclxuaW1wb3J0IHsgQXdzUzNNb2R1bGUgfSBmcm9tIFwiLi4vc3JjL2F3c1MzTW9kdWxlXCI7XHJcbmltcG9ydCB7IGNyZWF0ZURpcklmTm90RXhpc3RzLCBkZWxldGVGb2xkZXIgfSBmcm9tIFwiLi4vc3JjL2ZpbGVzSGVscGVyXCI7XHJcblxyXG5kZXNjcmliZShcImF3cyBzMyB0ZXN0c1wiLCAoKSA9PiB7XHJcbiAgbGV0IGF3c1MzTW9kdWxlOiBBd3NTM01vZHVsZTtcclxuXHJcbiAgY29uc3QgYnVja2V0TmFtZSA9IFwiYnVja2V0XCI7XHJcbiAgY29uc3QgdGVtcEZvbGRlciA9IFwidGVtcEZvbGRlclwiO1xyXG4gIGNvbnN0IGZpbGVDb250ZW50ID0gXCJzb21lIGRhdGEgMTIzXCI7XHJcbiAgY29uc3QgYXdzRmlsZVRlbXAgPSBcImJ1Y2tldC9uZXdmaWxlLnR4dFwiO1xyXG4gIGNvbnN0IG5ld0ZpbGVQYXRoID0gXCIuL3RlbXBGb2xkZXIvbmV3ZmlsZS50eHRcIjtcclxuXHJcbiAgQVdTTW9jay5jb25maWcuYmFzZVBhdGggPSBcIi4vXCI7XHJcbiAgbGV0IHMzID0gQVdTTW9jay5TMyh7XHJcbiAgICBwYXJhbXM6IHtcclxuICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxyXG4gICAgICBEZWxpbWl0ZXI6IFwiL1wiLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgaXQoXCJkb3dubG9hZEZpbGVGcm9tUzMgZG93bmxvYWRzIHRoZSBmaWxlIHRvIGxvY2FsIGZvbGRlciBzdWNjZXNzZnVsbHlcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gZ2l2ZW5cclxuICAgIGNyZWF0ZURpcklmTm90RXhpc3RzKFwiLi9cIiwgYnVja2V0TmFtZSk7XHJcbiAgICBjcmVhdGVEaXJJZk5vdEV4aXN0cyhcIi4vXCIsIHRlbXBGb2xkZXIpO1xyXG4gICAgZnMuYXBwZW5kRmlsZShhd3NGaWxlVGVtcCwgZmlsZUNvbnRlbnQsIGVyciA9PiB7XHJcbiAgICAgIGV4cGVjdChlcnIpLnRvLmVxdWFsKG51bGwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gYWN0XHJcbiAgICBhd3NTM01vZHVsZSA9IG5ldyBBd3NTM01vZHVsZShidWNrZXROYW1lLCB0ZW1wRm9sZGVyLCBzMyk7XHJcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgYXdzUzNNb2R1bGUuZG93bmxvYWRGaWxlRnJvbVMzKHsgS2V5OiBcIm5ld2ZpbGUudHh0XCIgfSk7XHJcblxyXG4gICAgLy8gdmVyaWZ5IGZpbGUgaXMgZG93bmxvYWRlZCBhbmQgaXRcInMgY29udGVudFxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIGZzLnJlYWRGaWxlKG5ld0ZpbGVQYXRoLCBcInV0ZjhcIiwgKGVyciwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGV4cGVjdChmaWxlQ29udGVudCkudG8uZGVlcC5lcXVhbChkYXRhKTtcclxuICAgICAgICBleHBlY3QoZXJyKS50by5lcXVhbChudWxsKTtcclxuXHJcbiAgICAgICAgLy8gZGVsZXRlIGZpbGVzIGFuZCBmb2xkZXJzXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGRlbGV0ZUZvbGRlcihidWNrZXROYW1lKTtcclxuICAgICAgICAgIGRlbGV0ZUZvbGRlcih0ZW1wRm9sZGVyKTtcclxuICAgICAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYGV4Y2VwdGlvbiB0aHJvd24gd2hpbGUgZGVsZXRpbmcgZmlsZXMgYW5kIGZvbGRlcnM6ICR7ZXh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGl0KFwiZG93bmxvYWRGaWxlRnJvbVMzIHJlamVjdHMgcmVxdWVzdCB3aGVuIGZpbGUgZG9lc24ndCBleGlzdHNcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gZ2l2ZW5cclxuICAgIGNyZWF0ZURpcklmTm90RXhpc3RzKFwiLi9cIiwgdGVtcEZvbGRlcik7XHJcblxyXG4gICAgLy8gYWN0XHJcbiAgICBhd3NTM01vZHVsZSA9IG5ldyBBd3NTM01vZHVsZShidWNrZXROYW1lLCB0ZW1wRm9sZGVyLCBzMyk7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGF3c1MzTW9kdWxlLmRvd25sb2FkRmlsZUZyb21TMyh7IEtleTogXCJuZXdmaWxlLnR4dFwiIH0pLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgLy8gdmVyaWZ5XHJcbiAgICAgIGV4cGVjdChlcnIuY29kZSkudG8uZXF1YWwoXCJFTk9FTlRcIik7XHJcbiAgICAgIC8vIGRlbGV0ZSBmaWxlcyBhbmQgZm9sZGVyc1xyXG4gICAgICBkZWxldGVGb2xkZXIodGVtcEZvbGRlcik7XHJcbiAgICB9KTtcclxuICB9KTtcclxufSk7XHJcbiJdLCJzb3VyY2VSb290IjoiLi4ifQ==
