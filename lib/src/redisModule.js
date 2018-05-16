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
const logger_1 = require("./logger");
class RedisModule {
    constructor(redisClient, bucketName) {
        this.redisClient = redisClient;
        this.bucketName = bucketName;
    }
    isFileInRedis(awsFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const fileName = this.bucketName + "/" + awsFile.Key;
                this.redisClient.get(fileName, function (err, value) {
                    if (value === null) {
                        logger_1.winston.verbose(`file ${fileName} not found in redis`);
                        resolve(null);
                    }
                    if (value) {
                        logger_1.winston.verbose(`file ${fileName} was found in redis`);
                        resolve(JSON.parse(value));
                    }
                    if (err) {
                        reject(err);
                    }
                });
            });
        });
    }
    addFileToRedis(awsFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
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
                    logger_1.winston.verbose(`Added file ${fileName} successfully to redis`);
                    resolve();
                });
            });
        });
    }
}
exports.RedisModule = RedisModule;
class RedisObject {
}
exports.RedisObject = RedisObject;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWRpc01vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUEscUNBQW1DO0FBR25DO0lBS0ksWUFBWSxXQUF5QixFQUFFLFVBQWtCO1FBQ3JELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFWSxhQUFhLENBQUMsT0FBc0I7O1lBQzdDLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFjLENBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxLQUFLO29CQUMvQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakIsZ0JBQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxRQUFRLHFCQUFxQixDQUFDLENBQUM7d0JBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEIsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNSLGdCQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsUUFBUSxxQkFBcUIsQ0FBQyxDQUFDO3dCQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUMvQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFWSxjQUFjLENBQUMsT0FBc0I7O1lBQzlDLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQ3JDLE1BQU0sZUFBZSxHQUFHO29CQUNwQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7b0JBQ2xDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtvQkFDbEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO29CQUNsQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQ3BCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtpQkFFckMsQ0FBQztnQkFDRixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEdBQUc7b0JBQ2pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixDQUFDO29CQUVELGdCQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsUUFBUSx3QkFBd0IsQ0FBQyxDQUFDO29CQUNoRSxPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUFuREQsa0NBbURDO0FBRUQ7Q0FNQztBQU5ELGtDQU1DIiwiZmlsZSI6InNyYy9yZWRpc01vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tIFwiYXdzLXNka1wiO1xyXG5pbXBvcnQgKiBhcyByZWRpcyBmcm9tIFwicmVkaXNcIjtcclxuaW1wb3J0IHsgd2luc3RvbiB9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWRpc01vZHVsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSByZWRpc0NsaWVudDtcclxuICAgIHByaXZhdGUgYnVja2V0TmFtZTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlZGlzQ2xpZW50OiByZWRpcy5jbGllbnQsIGJ1Y2tldE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMucmVkaXNDbGllbnQgPSByZWRpc0NsaWVudDtcclxuICAgICAgICB0aGlzLmJ1Y2tldE5hbWUgPSBidWNrZXROYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBpc0ZpbGVJblJlZGlzKGF3c0ZpbGU6IEFXUy5TMy5PYmplY3QpOiBQcm9taXNlPFJlZGlzT2JqZWN0PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPFJlZGlzT2JqZWN0PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5idWNrZXROYW1lICsgXCIvXCIgKyBhd3NGaWxlLktleTtcclxuICAgICAgICAgICAgdGhpcy5yZWRpc0NsaWVudC5nZXQoZmlsZU5hbWUsIGZ1bmN0aW9uIChlcnIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLnZlcmJvc2UoYGZpbGUgJHtmaWxlTmFtZX0gbm90IGZvdW5kIGluIHJlZGlzYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbnN0b24udmVyYm9zZShgZmlsZSAke2ZpbGVOYW1lfSB3YXMgZm91bmQgaW4gcmVkaXNgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UodmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGFkZEZpbGVUb1JlZGlzKGF3c0ZpbGU6IEFXUy5TMy5PYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50VG9VcGxvYWQgPSB7XHJcbiAgICAgICAgICAgICAgICBMYXN0TW9kaWZpZWQ6IGF3c0ZpbGUuTGFzdE1vZGlmaWVkLFxyXG4gICAgICAgICAgICAgICAgRVRhZzogYXdzRmlsZS5FVGFnLFxyXG4gICAgICAgICAgICAgICAgU2l6ZTogYXdzRmlsZS5TaXplLFxyXG4gICAgICAgICAgICAgICAgT3duZXI6IGF3c0ZpbGUuT3duZXIsXHJcbiAgICAgICAgICAgICAgICBTdG9yYWdlQ2xhc3M6IGF3c0ZpbGUuU3RvcmFnZUNsYXNzLFxyXG5cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgc3RyaW5naWZ5RWxlbWVudCA9IEpTT04uc3RyaW5naWZ5KGVsZW1lbnRUb1VwbG9hZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5idWNrZXROYW1lICsgXCIvXCIgKyBhd3NGaWxlLktleTtcclxuICAgICAgICAgICAgdGhpcy5yZWRpc0NsaWVudC5zZXQoZmlsZU5hbWUsIHN0cmluZ2lmeUVsZW1lbnQsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aW5zdG9uLnZlcmJvc2UoYEFkZGVkIGZpbGUgJHtmaWxlTmFtZX0gc3VjY2Vzc2Z1bGx5IHRvIHJlZGlzYCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUmVkaXNPYmplY3Qge1xyXG4gICAgTGFzdE1vZGlmaWVkOiBEYXRlO1xyXG4gICAgRVRhZzogc3RyaW5nO1xyXG4gICAgU2l6ZTogbnVtYmVyO1xyXG4gICAgT3duZXI6IHN0cmluZztcclxuICAgIFN0b3JhZ2VDbGFzczogc3RyaW5nO1xyXG59Il0sInNvdXJjZVJvb3QiOiIuLiJ9
