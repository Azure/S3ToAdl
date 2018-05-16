import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { winston } from "./logger";

/**
 * Return the names of all the directories in the file path
 * Example: for dir1/dir2/dir3/filename return [dir1, dir2, dir3];
 */
export function getDirectoriesPathArray(filePath: string): string[] {
    const filePathArray = filePath.split("/");
    return filePathArray.slice(0, filePathArray.length - 1);
}

/**
 * Create directory if it not exist.
 * Create it by path and directory name, or by the full path.
 */
export function createDirIfNotExists(filePath?: string, dirName?: string, fullFilePath?: string): void {
    const fullPath = fullFilePath || path.join(filePath, dirName);

    if (!fs.existsSync(fullPath)) {
        winston.verbose(`Creating directory ${fullPath}`);
        fs.mkdirSync(fullPath);
    }
}

export function deleteFile(filePath: string) {
    // Delete local file
    try {
        fs.unlinkSync(filePath);
        winston.verbose(`file ${filePath} was deleted from local folder`);
    } catch (ex) {
        winston.error(`Error deleting file ${filePath}`);
    }

}

export async function deleteFolder(path: string): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
        rimraf(path, (err) => {
            if (err) {
                winston.error(`Error deleting directories ${err}`);
                reject(err);
            }
            resolve();
        });
    });
}