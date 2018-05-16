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
const filesHelper_1 = require("./filesHelper");
const logger_1 = require("./logger");
class AwsS3Module {
    constructor(bucketName, tempFolder, s3Client) {
        this.bucketName = bucketName;
        this.tempFolder = tempFolder;
        this.s3Client = s3Client;
    }
    /**
     * Get a list of all files in S3 bucket - including sub directories gets 1000 at a time.
     * @param marker - Indicates the start point of the list object.
     */
    listAllObjects(marker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this.s3Client.listObjects({ Bucket: this.bucketName, Marker: marker, MaxKeys: 1000 }, (error, data) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(data);
                });
            });
        });
    }
    /**
     * Download file from S3 to local directory
     * @param awsFile - the file to download from s3
     */
    downloadFileFromS3(awsFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!awsFile || !awsFile.Key) {
                logger_1.winston.error("aws file is undefined");
                return;
            }
            const params = { Bucket: this.bucketName, Key: awsFile.Key };
            const directoriesList = filesHelper_1.getDirectoriesPathArray(awsFile.Key);
            let fullPath = this.tempFolder;
            directoriesList.forEach(dir => {
                filesHelper_1.createDirIfNotExists(fullPath, dir);
                fullPath += "/" + dir;
            });
            const file = fs.createWriteStream(path.join(this.tempFolder, awsFile.Key));
            logger_1.winston.info(`Downloading ${awsFile.Key} from S3`);
            yield new Promise((resolve, reject) => {
                this.s3Client.getObject(params).createReadStream()
                    .on("end", () => resolve())
                    .on("error", error => reject(error))
                    .pipe(file);
            });
        });
    }
}
exports.AwsS3Module = AwsS3Module;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hd3NTM01vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0EseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QiwrQ0FBOEU7QUFDOUUscUNBQW1DO0FBRW5DO0lBS0ksWUFBWSxVQUFrQixFQUFFLFVBQWtCLEVBQUUsUUFBZ0I7UUFDaEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7T0FHRztJQUNVLGNBQWMsQ0FBQyxNQUFlOztZQUN2QyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBMkIsQ0FBQyxPQUFPLEVBQUUsTUFBTTtnQkFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJO29CQUM5RixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNSLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pCLENBQUM7b0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLGtCQUFrQixDQUFDLE9BQXNCOztZQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixnQkFBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUM7WUFDWCxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzdELE1BQU0sZUFBZSxHQUFHLHFDQUF1QixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU3RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQy9CLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRztnQkFDdkIsa0NBQW9CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxRQUFRLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0UsZ0JBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixFQUFFO3FCQUM3QyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sT0FBTyxFQUFFLENBQUM7cUJBQzFCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUF2REQsa0NBdURDIiwiZmlsZSI6InNyYy9hd3NTM01vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tIFwiYXdzLXNka1wiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjcmVhdGVEaXJJZk5vdEV4aXN0cywgZ2V0RGlyZWN0b3JpZXNQYXRoQXJyYXkgfSBmcm9tIFwiLi9maWxlc0hlbHBlclwiO1xyXG5pbXBvcnQgeyB3aW5zdG9uIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQXdzUzNNb2R1bGUge1xyXG4gICAgcHVibGljIHMzQ2xpZW50OiBBV1MuUzM7XHJcbiAgICBwcml2YXRlIGJ1Y2tldE5hbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgdGVtcEZvbGRlcjogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGJ1Y2tldE5hbWU6IHN0cmluZywgdGVtcEZvbGRlcjogc3RyaW5nLCBzM0NsaWVudDogQVdTLlMzKSB7XHJcbiAgICAgICAgdGhpcy5idWNrZXROYW1lID0gYnVja2V0TmFtZTtcclxuICAgICAgICB0aGlzLnRlbXBGb2xkZXIgPSB0ZW1wRm9sZGVyO1xyXG4gICAgICAgIHRoaXMuczNDbGllbnQgPSBzM0NsaWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhIGxpc3Qgb2YgYWxsIGZpbGVzIGluIFMzIGJ1Y2tldCAtIGluY2x1ZGluZyBzdWIgZGlyZWN0b3JpZXMgZ2V0cyAxMDAwIGF0IGEgdGltZS5cclxuICAgICAqIEBwYXJhbSBtYXJrZXIgLSBJbmRpY2F0ZXMgdGhlIHN0YXJ0IHBvaW50IG9mIHRoZSBsaXN0IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGxpc3RBbGxPYmplY3RzKG1hcmtlcj86IHN0cmluZyk6IFByb21pc2U8QVdTLlMzLkxpc3RPYmplY3RzT3V0cHV0PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPEFXUy5TMy5MaXN0T2JqZWN0c091dHB1dD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnMzQ2xpZW50Lmxpc3RPYmplY3RzKHsgQnVja2V0OiB0aGlzLmJ1Y2tldE5hbWUsIE1hcmtlcjogbWFya2VyLCBNYXhLZXlzOiAxMDAwIH0sIChlcnJvciwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRG93bmxvYWQgZmlsZSBmcm9tIFMzIHRvIGxvY2FsIGRpcmVjdG9yeVxyXG4gICAgICogQHBhcmFtIGF3c0ZpbGUgLSB0aGUgZmlsZSB0byBkb3dubG9hZCBmcm9tIHMzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBkb3dubG9hZEZpbGVGcm9tUzMoYXdzRmlsZTogQVdTLlMzLk9iamVjdCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICghYXdzRmlsZSB8fCAhYXdzRmlsZS5LZXkpIHtcclxuICAgICAgICAgICAgd2luc3Rvbi5lcnJvcihcImF3cyBmaWxlIGlzIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyYW1zID0geyBCdWNrZXQ6IHRoaXMuYnVja2V0TmFtZSwgS2V5OiBhd3NGaWxlLktleSB9O1xyXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yaWVzTGlzdCA9IGdldERpcmVjdG9yaWVzUGF0aEFycmF5KGF3c0ZpbGUuS2V5KTtcclxuXHJcbiAgICAgICAgbGV0IGZ1bGxQYXRoID0gdGhpcy50ZW1wRm9sZGVyO1xyXG4gICAgICAgIGRpcmVjdG9yaWVzTGlzdC5mb3JFYWNoKGRpciA9PiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZURpcklmTm90RXhpc3RzKGZ1bGxQYXRoLCBkaXIpO1xyXG4gICAgICAgICAgICBmdWxsUGF0aCArPSBcIi9cIiArIGRpcjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHBhdGguam9pbih0aGlzLnRlbXBGb2xkZXIsIGF3c0ZpbGUuS2V5KSk7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKGBEb3dubG9hZGluZyAke2F3c0ZpbGUuS2V5fSBmcm9tIFMzYCk7XHJcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnMzQ2xpZW50LmdldE9iamVjdChwYXJhbXMpLmNyZWF0ZVJlYWRTdHJlYW0oKVxyXG4gICAgICAgICAgICAgICAgLm9uKFwiZW5kXCIsICgpID0+IHJlc29sdmUoKSlcclxuICAgICAgICAgICAgICAgIC5vbihcImVycm9yXCIsIGVycm9yID0+IHJlamVjdChlcnJvcikpXHJcbiAgICAgICAgICAgICAgICAucGlwZShmaWxlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii4uIn0=
