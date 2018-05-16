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
const s3ToAdlDataCopy_1 = require("../src/s3ToAdlDataCopy");
function E2EFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate all environment variables are set (validation is part of the ctor)
        const s3ToAdlDataCopy = new s3ToAdlDataCopy_1.S3ToAdlDataCopy();
        const dummyFileName = "test1/tempFile.txt";
        const fileContent = "data 1234";
        // Upload dummy file to S3
        yield new Promise((resolve, reject) => {
            s3ToAdlDataCopy.awsClient.putObject({
                Bucket: s3ToAdlDataCopy.awsBucketName,
                Key: dummyFileName,
                Body: fileContent,
            }, (err, data) => {
                if (err) {
                    console.log(`Error uploading file to s3: ${err}`);
                    reject(err);
                }
                else {
                    console.log("Uploaded file to s3 successfully");
                    resolve();
                }
            });
        });
        // Run flow to upload file to ADL
        yield s3ToAdlDataCopy.handler(() => {
            console.log("completed");
        });
        // Verify the file exists in ADL and have the right content
        try {
            let status = yield s3ToAdlDataCopy.adlClient.fileSystem.getFileStatus(s3ToAdlDataCopy.azureAdlAccountName, dummyFileName);
            if (status.fileStatus.length !== fileContent.length) {
                throw new Error("File doesn't have the expected content");
            }
            else {
                console.log("E2E worked as expected!");
            }
        }
        catch (ex) {
            console.log(`file doesn't exist in the expected location: ${ex}`);
        }
    });
}
E2EFlow();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rlc3QvZTJlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNERBQXlEO0FBRXpEOztRQUNJLDhFQUE4RTtRQUM5RSxNQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLEVBQUUsQ0FBQztRQUM5QyxNQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFaEMsMEJBQTBCO1FBQzFCLE1BQU0sSUFBSSxPQUFPLENBQTJCLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDeEQsZUFBZSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hDLE1BQU0sRUFBRSxlQUFlLENBQUMsYUFBYTtnQkFDckMsR0FBRyxFQUFFLGFBQWE7Z0JBQ2xCLElBQUksRUFBRSxXQUFXO2FBQ3BCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtnQkFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEdBQUcsRUFBRSxDQUFDLENBQUM7b0JBQ2xELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7b0JBQ2hELE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELElBQUksQ0FBQztZQUNELElBQUksTUFBTSxHQUFHLE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMxSCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBQzlELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBRUQsT0FBTyxFQUFFLENBQUMiLCJmaWxlIjoidGVzdC9lMmVUZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUzNUb0FkbERhdGFDb3B5IH0gZnJvbSBcIi4uL3NyYy9zM1RvQWRsRGF0YUNvcHlcIjtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIEUyRUZsb3coKSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBhbGwgZW52aXJvbm1lbnQgdmFyaWFibGVzIGFyZSBzZXQgKHZhbGlkYXRpb24gaXMgcGFydCBvZiB0aGUgY3RvcilcclxuICAgIGNvbnN0IHMzVG9BZGxEYXRhQ29weSA9IG5ldyBTM1RvQWRsRGF0YUNvcHkoKTtcclxuICAgIGNvbnN0IGR1bW15RmlsZU5hbWUgPSBcInRlc3QxL3RlbXBGaWxlLnR4dFwiO1xyXG4gICAgY29uc3QgZmlsZUNvbnRlbnQgPSBcImRhdGEgMTIzNFwiO1xyXG5cclxuICAgIC8vIFVwbG9hZCBkdW1teSBmaWxlIHRvIFMzXHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTxBV1MuUzMuTGlzdE9iamVjdHNPdXRwdXQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBzM1RvQWRsRGF0YUNvcHkuYXdzQ2xpZW50LnB1dE9iamVjdCh7XHJcbiAgICAgICAgICAgIEJ1Y2tldDogczNUb0FkbERhdGFDb3B5LmF3c0J1Y2tldE5hbWUsXHJcbiAgICAgICAgICAgIEtleTogZHVtbXlGaWxlTmFtZSxcclxuICAgICAgICAgICAgQm9keTogZmlsZUNvbnRlbnQsXHJcbiAgICAgICAgfSwgKGVyciwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3IgdXBsb2FkaW5nIGZpbGUgdG8gczM6ICR7ZXJyfWApO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVwbG9hZGVkIGZpbGUgdG8gczMgc3VjY2Vzc2Z1bGx5XCIpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSdW4gZmxvdyB0byB1cGxvYWQgZmlsZSB0byBBRExcclxuICAgIGF3YWl0IHMzVG9BZGxEYXRhQ29weS5oYW5kbGVyKCgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNvbXBsZXRlZFwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGUgZmlsZSBleGlzdHMgaW4gQURMIGFuZCBoYXZlIHRoZSByaWdodCBjb250ZW50XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBzdGF0dXMgPSBhd2FpdCBzM1RvQWRsRGF0YUNvcHkuYWRsQ2xpZW50LmZpbGVTeXN0ZW0uZ2V0RmlsZVN0YXR1cyhzM1RvQWRsRGF0YUNvcHkuYXp1cmVBZGxBY2NvdW50TmFtZSwgZHVtbXlGaWxlTmFtZSk7XHJcbiAgICAgICAgaWYgKHN0YXR1cy5maWxlU3RhdHVzLmxlbmd0aCAhPT0gZmlsZUNvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpbGUgZG9lc24ndCBoYXZlIHRoZSBleHBlY3RlZCBjb250ZW50XCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRTJFIHdvcmtlZCBhcyBleHBlY3RlZCFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgZmlsZSBkb2Vzbid0IGV4aXN0IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbjogJHtleH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuRTJFRmxvdygpOyJdLCJzb3VyY2VSb290IjoiLi4ifQ==
