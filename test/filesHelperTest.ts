import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as sinon from "sinon";
import { createDirIfNotExists, deleteFile, getDirectoriesPathArray } from "../src/filesHelper";

describe("getDirectoriesPathArray tests", () => {
    it("getDirectoriesPathArray returns the expected path", () => {
        // given
        let path = "dir1/dir2/dir3/file.txt";
        let expectedResult = ["dir1", "dir2", "dir3"];

        // act
        let result = getDirectoriesPathArray(path);

        // assert
        expect(expectedResult).to.deep.equal(result);
    });

    it("getDirectoriesPathArray returns empty string for file name without path", () => {
        // given
        let path = "file.txt";
        let expectedResult = [];

        // act
        let result = getDirectoriesPathArray(path);

        // assert
        expect(expectedResult).to.deep.equal(result);
    });
});

describe("createDirIfNotExists tests", () => {
    it("createDirIfNotExists creates the expected dir for given file path and dir name", () => {
        // given
        let path = "./";
        let dirName = "newdir";

        // act
        createDirIfNotExists(path, dirName);

        // assert
        const fullPath = path + dirName;
        expect(fs.existsSync(fullPath)).to.equal(true);
        fs.rmdir(fullPath, (err) => {
            expect(err).to.equal(null);
        });
    });

    it("createDirIfNotExists creates the expected dir for given file path and dir name", () => {
        // given
        let path = "./newdir";

        // act
        createDirIfNotExists(null, null, path);

        // assert
        expect(fs.existsSync(path)).to.equal(true);
        fs.rmdir(path, (err) => {
            expect(err).to.equal(null);
        });
    });
});