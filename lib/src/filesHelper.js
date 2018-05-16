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
const rimraf = require("rimraf");
const logger_1 = require("./logger");
/**
 * Return the names of all the directories in the file path
 * Example: for dir1/dir2/dir3/filename return [dir1, dir2, dir3];
 */
function getDirectoriesPathArray(filePath) {
    const filePathArray = filePath.split("/");
    return filePathArray.slice(0, filePathArray.length - 1);
}
exports.getDirectoriesPathArray = getDirectoriesPathArray;
/**
 * Create directory if it not exist.
 * Create it by path and directory name, or by the full path.
 */
function createDirIfNotExists(filePath, dirName, fullFilePath) {
    const fullPath = fullFilePath || path.join(filePath, dirName);
    if (!fs.existsSync(fullPath)) {
        logger_1.winston.verbose(`Creating directory ${fullPath}`);
        fs.mkdirSync(fullPath);
    }
}
exports.createDirIfNotExists = createDirIfNotExists;
function deleteFile(filePath) {
    // Delete local file
    try {
        fs.unlinkSync(filePath);
        logger_1.winston.verbose(`file ${filePath} was deleted from local folder`);
    }
    catch (ex) {
        logger_1.winston.error(`Error deleting file ${filePath}`);
    }
}
exports.deleteFile = deleteFile;
function deleteFolder(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => {
            rimraf(path, (err) => {
                if (err) {
                    logger_1.winston.error(`Error deleting directories ${err}`);
                    reject(err);
                }
                resolve();
            });
        });
    });
}
exports.deleteFolder = deleteFolder;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxlc0hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFDakMscUNBQW1DO0FBRW5DOzs7R0FHRztBQUNILGlDQUF3QyxRQUFnQjtJQUNwRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFIRCwwREFHQztBQUVEOzs7R0FHRztBQUNILDhCQUFxQyxRQUFpQixFQUFFLE9BQWdCLEVBQUUsWUFBcUI7SUFDM0YsTUFBTSxRQUFRLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTlELEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsZ0JBQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQixDQUFDO0FBQ0wsQ0FBQztBQVBELG9EQU9DO0FBRUQsb0JBQTJCLFFBQWdCO0lBQ3ZDLG9CQUFvQjtJQUNwQixJQUFJLENBQUM7UUFDRCxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLGdCQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsUUFBUSxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1YsZ0JBQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUVMLENBQUM7QUFURCxnQ0FTQztBQUVELHNCQUFtQyxJQUFZOztRQUMzQyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHO2dCQUNiLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ04sZ0JBQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsRUFBRSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztnQkFDRCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQUE7QUFWRCxvQ0FVQyIsImZpbGUiOiJzcmMvZmlsZXNIZWxwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgKiBhcyByaW1yYWYgZnJvbSBcInJpbXJhZlwiO1xyXG5pbXBvcnQgeyB3aW5zdG9uIH0gZnJvbSBcIi4vbG9nZ2VyXCI7XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRoZSBuYW1lcyBvZiBhbGwgdGhlIGRpcmVjdG9yaWVzIGluIHRoZSBmaWxlIHBhdGhcclxuICogRXhhbXBsZTogZm9yIGRpcjEvZGlyMi9kaXIzL2ZpbGVuYW1lIHJldHVybiBbZGlyMSwgZGlyMiwgZGlyM107XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlyZWN0b3JpZXNQYXRoQXJyYXkoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgIGNvbnN0IGZpbGVQYXRoQXJyYXkgPSBmaWxlUGF0aC5zcGxpdChcIi9cIik7XHJcbiAgICByZXR1cm4gZmlsZVBhdGhBcnJheS5zbGljZSgwLCBmaWxlUGF0aEFycmF5Lmxlbmd0aCAtIDEpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGRpcmVjdG9yeSBpZiBpdCBub3QgZXhpc3QuXHJcbiAqIENyZWF0ZSBpdCBieSBwYXRoIGFuZCBkaXJlY3RvcnkgbmFtZSwgb3IgYnkgdGhlIGZ1bGwgcGF0aC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaXJJZk5vdEV4aXN0cyhmaWxlUGF0aD86IHN0cmluZywgZGlyTmFtZT86IHN0cmluZywgZnVsbEZpbGVQYXRoPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBmdWxsUGF0aCA9IGZ1bGxGaWxlUGF0aCB8fCBwYXRoLmpvaW4oZmlsZVBhdGgsIGRpck5hbWUpO1xyXG5cclxuICAgIGlmICghZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcclxuICAgICAgICB3aW5zdG9uLnZlcmJvc2UoYENyZWF0aW5nIGRpcmVjdG9yeSAke2Z1bGxQYXRofWApO1xyXG4gICAgICAgIGZzLm1rZGlyU3luYyhmdWxsUGF0aCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuICAgIC8vIERlbGV0ZSBsb2NhbCBmaWxlXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGZzLnVubGlua1N5bmMoZmlsZVBhdGgpO1xyXG4gICAgICAgIHdpbnN0b24udmVyYm9zZShgZmlsZSAke2ZpbGVQYXRofSB3YXMgZGVsZXRlZCBmcm9tIGxvY2FsIGZvbGRlcmApO1xyXG4gICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgICB3aW5zdG9uLmVycm9yKGBFcnJvciBkZWxldGluZyBmaWxlICR7ZmlsZVBhdGh9YCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlRm9sZGVyKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICByaW1yYWYocGF0aCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5zdG9uLmVycm9yKGBFcnJvciBkZWxldGluZyBkaXJlY3RvcmllcyAke2Vycn1gKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59Il0sInNvdXJjZVJvb3QiOiIuLiJ9
