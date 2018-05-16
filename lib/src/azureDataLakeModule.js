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
const fs = require("fs");
const path = require("path");
const filesHelper = require("./filesHelper");
const logger_1 = require("./logger");
class AzureDataLakeModule {
    constructor(accountName, tempFolder, fileSystemClient, bucketName) {
        this.accountName = accountName;
        this.tempFolder = tempFolder;
        this.filesystemClient = fileSystemClient;
        this.bucketName = bucketName;
    }
    /**
     * Checks if aws file exists in ADL, or if S3 holds a newer version of file
     * @param awsFile - the file to validate
     */
    shouldUploadToADL(awsFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileFullName = this.bucketName + "/" + awsFile.Key;
            try {
                const file = yield this.filesystemClient.fileSystem.getFileStatus(this.accountName, fileFullName);
                logger_1.winston.verbose(`file: ${fileFullName} already exists in data lake`);
                // If file exist in Azure Data Lake but it"s been updated in aws - upload it again
                return file.fileStatus.modificationTime < awsFile.LastModified.getTime();
            }
            catch (ex) {
                if (ex.body && ex.body && ex.body.remoteException && ex.body.remoteException.exception === "FileNotFoundException") {
                    logger_1.winston.info(`file: ${fileFullName} doesn't exists in ADL`);
                    return true;
                }
                else {
                    logger_1.winston.error(`shouldUploadToADL unknown error: ${ex}`);
                    throw ex;
                }
            }
        });
    }
    /**
     *  Upload local file to ADL.
     *  Validates that all directories in the file path exists in ADL files system - if not create the missing directories
     * @param filePath - the path where the file to upload is located
     */
    uploadFileToAzureDataLake(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePathToUpload = this.bucketName + "/" + filePath;
            const directoriesList = filesHelper.getDirectoriesPathArray(filePathToUpload);
            const localFilePath = path.join(this.tempFolder, filePath);
            try {
                // Create folders in ADL if needed
                yield this.filesystemClient.fileSystem.mkdirs(this.accountName, directoriesList.join("/"));
                const options = {
                    overwrite: true,
                    streamContents: fs.createReadStream(localFilePath),
                };
                // Upload file to Azure Data Lake
                yield this.filesystemClient.fileSystem.create(this.accountName, filePathToUpload, options);
                logger_1.winston.info(`Upload file ${filePathToUpload} successfully`);
            }
            catch (ex) {
                logger_1.winston.error(`error while uploading file to ADL: ${ex}`);
                throw ex;
            }
        });
    }
}
exports.AzureDataLakeModule = AzureDataLakeModule;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9henVyZURhdGFMYWtlTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZDQUE2QztBQUM3QyxxQ0FBbUM7QUFFbkM7SUFNRSxZQUFZLFdBQW1CLEVBQUUsVUFBa0IsRUFBRSxnQkFBOEQsRUFDakgsVUFBa0I7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDVSxpQkFBaUIsQ0FBQyxPQUFzQjs7WUFDbkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN6RCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNsRyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFlBQVksOEJBQThCLENBQUMsQ0FBQztnQkFFckUsa0ZBQWtGO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNFLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEtBQUssdUJBQXVCLENBQUMsQ0FBQyxDQUFDO29CQUNuSCxnQkFBTyxDQUFDLElBQUksQ0FBQyxTQUFTLFlBQVksd0JBQXdCLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLGdCQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUN4RCxNQUFNLEVBQUUsQ0FBQztnQkFDWCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSx5QkFBeUIsQ0FBQyxRQUFnQjs7WUFDckQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDMUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRTNELElBQUksQ0FBQztnQkFDSCxrQ0FBa0M7Z0JBQ2xDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRTNGLE1BQU0sT0FBTyxHQUFHO29CQUNkLFNBQVMsRUFBRSxJQUFJO29CQUNmLGNBQWMsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO2lCQUNuRCxDQUFDO2dCQUVGLGlDQUFpQztnQkFFakMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMzRixnQkFBTyxDQUFDLElBQUksQ0FBQyxlQUFlLGdCQUFnQixlQUFlLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDWixnQkFBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxFQUFFLENBQUM7WUFDWCxDQUFDO1FBQ0gsQ0FBQztLQUFBO0NBQ0Y7QUFsRUQsa0RBa0VDIiwiZmlsZSI6InNyYy9henVyZURhdGFMYWtlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XHJcbmltcG9ydCAqIGFzIGFkbHNNYW5hZ2VtZW50IGZyb20gXCJhenVyZS1hcm0tZGF0YWxha2Utc3RvcmVcIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0ICogYXMgZmlsZXNIZWxwZXIgZnJvbSBcIi4vZmlsZXNIZWxwZXJcIjtcclxuaW1wb3J0IHsgd2luc3RvbiB9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEF6dXJlRGF0YUxha2VNb2R1bGUge1xyXG4gIHByaXZhdGUgZmlsZXN5c3RlbUNsaWVudDogYWRsc01hbmFnZW1lbnQuRGF0YUxha2VTdG9yZUZpbGVTeXN0ZW1DbGllbnQ7XHJcbiAgcHJpdmF0ZSBhY2NvdW50TmFtZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgdGVtcEZvbGRlcjogc3RyaW5nO1xyXG4gIHByaXZhdGUgYnVja2V0TmFtZTogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhY2NvdW50TmFtZTogc3RyaW5nLCB0ZW1wRm9sZGVyOiBzdHJpbmcsIGZpbGVTeXN0ZW1DbGllbnQ6IGFkbHNNYW5hZ2VtZW50LkRhdGFMYWtlU3RvcmVGaWxlU3lzdGVtQ2xpZW50LFxyXG4gICAgYnVja2V0TmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmFjY291bnROYW1lID0gYWNjb3VudE5hbWU7XHJcbiAgICB0aGlzLnRlbXBGb2xkZXIgPSB0ZW1wRm9sZGVyO1xyXG4gICAgdGhpcy5maWxlc3lzdGVtQ2xpZW50ID0gZmlsZVN5c3RlbUNsaWVudDtcclxuICAgIHRoaXMuYnVja2V0TmFtZSA9IGJ1Y2tldE5hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgaWYgYXdzIGZpbGUgZXhpc3RzIGluIEFETCwgb3IgaWYgUzMgaG9sZHMgYSBuZXdlciB2ZXJzaW9uIG9mIGZpbGVcclxuICAgKiBAcGFyYW0gYXdzRmlsZSAtIHRoZSBmaWxlIHRvIHZhbGlkYXRlXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIHNob3VsZFVwbG9hZFRvQURMKGF3c0ZpbGU6IEFXUy5TMy5PYmplY3QpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGNvbnN0IGZpbGVGdWxsTmFtZSA9IHRoaXMuYnVja2V0TmFtZSArIFwiL1wiICsgYXdzRmlsZS5LZXk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5maWxlc3lzdGVtQ2xpZW50LmZpbGVTeXN0ZW0uZ2V0RmlsZVN0YXR1cyh0aGlzLmFjY291bnROYW1lLCBmaWxlRnVsbE5hbWUpO1xyXG4gICAgICB3aW5zdG9uLnZlcmJvc2UoYGZpbGU6ICR7ZmlsZUZ1bGxOYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBkYXRhIGxha2VgKTtcclxuXHJcbiAgICAgIC8vIElmIGZpbGUgZXhpc3QgaW4gQXp1cmUgRGF0YSBMYWtlIGJ1dCBpdFwicyBiZWVuIHVwZGF0ZWQgaW4gYXdzIC0gdXBsb2FkIGl0IGFnYWluXHJcbiAgICAgIHJldHVybiBmaWxlLmZpbGVTdGF0dXMubW9kaWZpY2F0aW9uVGltZSA8IGF3c0ZpbGUuTGFzdE1vZGlmaWVkLmdldFRpbWUoKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICBpZiAoZXguYm9keSAmJiBleC5ib2R5ICYmIGV4LmJvZHkucmVtb3RlRXhjZXB0aW9uICYmIGV4LmJvZHkucmVtb3RlRXhjZXB0aW9uLmV4Y2VwdGlvbiA9PT0gXCJGaWxlTm90Rm91bmRFeGNlcHRpb25cIikge1xyXG4gICAgICAgIHdpbnN0b24uaW5mbyhgZmlsZTogJHtmaWxlRnVsbE5hbWV9IGRvZXNuJ3QgZXhpc3RzIGluIEFETGApO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdpbnN0b24uZXJyb3IoYHNob3VsZFVwbG9hZFRvQURMIHVua25vd24gZXJyb3I6ICR7ZXh9YCk7XHJcbiAgICAgICAgdGhyb3cgZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICBVcGxvYWQgbG9jYWwgZmlsZSB0byBBREwuXHJcbiAgICogIFZhbGlkYXRlcyB0aGF0IGFsbCBkaXJlY3RvcmllcyBpbiB0aGUgZmlsZSBwYXRoIGV4aXN0cyBpbiBBREwgZmlsZXMgc3lzdGVtIC0gaWYgbm90IGNyZWF0ZSB0aGUgbWlzc2luZyBkaXJlY3Rvcmllc1xyXG4gICAqIEBwYXJhbSBmaWxlUGF0aCAtIHRoZSBwYXRoIHdoZXJlIHRoZSBmaWxlIHRvIHVwbG9hZCBpcyBsb2NhdGVkXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIHVwbG9hZEZpbGVUb0F6dXJlRGF0YUxha2UoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZmlsZVBhdGhUb1VwbG9hZCA9IHRoaXMuYnVja2V0TmFtZSArIFwiL1wiICsgZmlsZVBhdGg7XHJcbiAgICBjb25zdCBkaXJlY3Rvcmllc0xpc3QgPSBmaWxlc0hlbHBlci5nZXREaXJlY3Rvcmllc1BhdGhBcnJheShmaWxlUGF0aFRvVXBsb2FkKTtcclxuICAgIGNvbnN0IGxvY2FsRmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy50ZW1wRm9sZGVyLCBmaWxlUGF0aCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gQ3JlYXRlIGZvbGRlcnMgaW4gQURMIGlmIG5lZWRlZFxyXG4gICAgICBhd2FpdCB0aGlzLmZpbGVzeXN0ZW1DbGllbnQuZmlsZVN5c3RlbS5ta2RpcnModGhpcy5hY2NvdW50TmFtZSwgZGlyZWN0b3JpZXNMaXN0LmpvaW4oXCIvXCIpKTtcclxuXHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxyXG4gICAgICAgIHN0cmVhbUNvbnRlbnRzOiBmcy5jcmVhdGVSZWFkU3RyZWFtKGxvY2FsRmlsZVBhdGgpLFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gVXBsb2FkIGZpbGUgdG8gQXp1cmUgRGF0YSBMYWtlXHJcbiAgICAgIFxyXG4gICAgICBhd2FpdCB0aGlzLmZpbGVzeXN0ZW1DbGllbnQuZmlsZVN5c3RlbS5jcmVhdGUodGhpcy5hY2NvdW50TmFtZSwgZmlsZVBhdGhUb1VwbG9hZCwgb3B0aW9ucyk7XHJcbiAgICAgIHdpbnN0b24uaW5mbyhgVXBsb2FkIGZpbGUgJHtmaWxlUGF0aFRvVXBsb2FkfSBzdWNjZXNzZnVsbHlgKTtcclxuICAgIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICAgIHdpbnN0b24uZXJyb3IoYGVycm9yIHdoaWxlIHVwbG9hZGluZyBmaWxlIHRvIEFETDogJHtleH1gKTtcclxuICAgICAgdGhyb3cgZXg7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiLi4ifQ==
