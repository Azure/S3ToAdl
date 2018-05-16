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
const adlsManagement = require("azure-arm-datalake-store");
const chai_1 = require("chai");
require("mocha");
const msrestAzure = require("ms-rest-azure");
const sinon = require("sinon");
const azureDataLakeModule_1 = require("../src/azureDataLakeModule");
describe("shouldUploadToADL tests", () => {
    let adlClient;
    let adlModule;
    beforeEach(function () {
        const credentials = new msrestAzure.ApplicationTokenCredentials("someclient", "domain", "secret");
        adlClient = new adlsManagement.DataLakeStoreFileSystemClient(credentials);
    });
    it("shouldUploadToADL returns true when adl file is old", () => __awaiter(this, void 0, void 0, function* () {
        // given
        const expectedResult = {
            fileStatus: {
                modificationTime: new Date(2016, 1, 1).getTime(),
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").returns(expectedResult);
        adlModule = new azureDataLakeModule_1.AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");
        // Act
        const result = yield adlModule.shouldUploadToADL({ LastModified: new Date(), Key: "key" });
        // Assert
        chai_1.expect(result).to.equal(true);
    }));
    it("shouldUploadToADL returns false when the file in s3 is not newer than the file in ADL", () => __awaiter(this, void 0, void 0, function* () {
        // given
        const expectedResult = {
            fileStatus: {
                modificationTime: new Date().getTime(),
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").returns(expectedResult);
        adlModule = new azureDataLakeModule_1.AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");
        // Act
        const result = yield adlModule.shouldUploadToADL({ LastModified: new Date(2016, 1, 1), Key: "key" });
        // Assert
        chai_1.expect(result).to.equal(false);
    }));
    it("shouldUploadToADL returns true when file does not exist in adl", () => __awaiter(this, void 0, void 0, function* () {
        // given ex.body.remoteException.exception
        let fileNotFoundException = {
            body: {
                remoteException: {
                    exception: "FileNotFoundException",
                },
            },
        };
        const stub = sinon.stub(adlClient.fileSystem, "getFileStatus").throws(fileNotFoundException);
        adlModule = new azureDataLakeModule_1.AzureDataLakeModule("accountName", "folderName", adlClient, "bucket");
        // Act
        const result = yield adlModule.shouldUploadToADL({ LastModified: new Date(), Key: "key" });
        // Assert
        chai_1.expect(result).to.equal(true);
    }));
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rlc3QvYXp1cmVEYXRhTGFrZU1vZHVsZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLDJEQUEyRDtBQUMzRCwrQkFBOEI7QUFDOUIsaUJBQWU7QUFDZiw2Q0FBNkM7QUFDN0MsK0JBQStCO0FBQy9CLG9FQUFpRTtBQUVqRSxRQUFRLENBQUMseUJBQXlCLEVBQUU7SUFDaEMsSUFBSSxTQUF1RCxDQUFDO0lBQzVELElBQUksU0FBOEIsQ0FBQztJQUVuQyxVQUFVLENBQUM7UUFDUCxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xHLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM5RSxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxREFBcUQsRUFBRTtRQUN0RCxRQUFRO1FBQ1IsTUFBTSxjQUFjLEdBQUc7WUFDbkIsVUFBVSxFQUFFO2dCQUNSLGdCQUFnQixFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO2FBQ25EO1NBQ0osQ0FBQztRQUNGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkYsU0FBUyxHQUFHLElBQUkseUNBQW1CLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdEYsTUFBTTtRQUNOLE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFM0YsU0FBUztRQUNULGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsdUZBQXVGLEVBQUU7UUFDeEYsUUFBUTtRQUNSLE1BQU0sY0FBYyxHQUFHO1lBQ25CLFVBQVUsRUFBRTtnQkFDUixnQkFBZ0IsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRTthQUN6QztTQUNKLENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZGLFNBQVMsR0FBRyxJQUFJLHlDQUFtQixDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXRGLE1BQU07UUFDTixNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXJHLFNBQVM7UUFDVCxhQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGdFQUFnRSxFQUFFO1FBQ2pFLDBDQUEwQztRQUMxQyxJQUFJLHFCQUFxQixHQUFHO1lBQ3hCLElBQUksRUFBRTtnQkFDRixlQUFlLEVBQUU7b0JBQ2IsU0FBUyxFQUFFLHVCQUF1QjtpQkFDckM7YUFDSjtTQUNKLENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDN0YsU0FBUyxHQUFHLElBQUkseUNBQW1CLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdEYsTUFBTTtRQUNOLE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFM0YsU0FBUztRQUNULGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZXN0L2F6dXJlRGF0YUxha2VNb2R1bGVUZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XHJcbmltcG9ydCAqIGFzIGFkbHNNYW5hZ2VtZW50IGZyb20gXCJhenVyZS1hcm0tZGF0YWxha2Utc3RvcmVcIjtcclxuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSBcImNoYWlcIjtcclxuaW1wb3J0IFwibW9jaGFcIjtcclxuaW1wb3J0ICogYXMgbXNyZXN0QXp1cmUgZnJvbSBcIm1zLXJlc3QtYXp1cmVcIjtcclxuaW1wb3J0ICogYXMgc2lub24gZnJvbSBcInNpbm9uXCI7XHJcbmltcG9ydCB7IEF6dXJlRGF0YUxha2VNb2R1bGUgfSBmcm9tIFwiLi4vc3JjL2F6dXJlRGF0YUxha2VNb2R1bGVcIjtcclxuXHJcbmRlc2NyaWJlKFwic2hvdWxkVXBsb2FkVG9BREwgdGVzdHNcIiwgKCkgPT4ge1xyXG4gICAgbGV0IGFkbENsaWVudDogYWRsc01hbmFnZW1lbnQuRGF0YUxha2VTdG9yZUZpbGVTeXN0ZW1DbGllbnQ7XHJcbiAgICBsZXQgYWRsTW9kdWxlOiBBenVyZURhdGFMYWtlTW9kdWxlO1xyXG5cclxuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnN0IGNyZWRlbnRpYWxzID0gbmV3IG1zcmVzdEF6dXJlLkFwcGxpY2F0aW9uVG9rZW5DcmVkZW50aWFscyhcInNvbWVjbGllbnRcIiwgXCJkb21haW5cIiwgXCJzZWNyZXRcIik7XHJcbiAgICAgICAgYWRsQ2xpZW50ID0gbmV3IGFkbHNNYW5hZ2VtZW50LkRhdGFMYWtlU3RvcmVGaWxlU3lzdGVtQ2xpZW50KGNyZWRlbnRpYWxzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkVXBsb2FkVG9BREwgcmV0dXJucyB0cnVlIHdoZW4gYWRsIGZpbGUgaXMgb2xkXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAvLyBnaXZlblxyXG4gICAgICAgIGNvbnN0IGV4cGVjdGVkUmVzdWx0ID0ge1xyXG4gICAgICAgICAgICBmaWxlU3RhdHVzOiB7XHJcbiAgICAgICAgICAgICAgICBtb2RpZmljYXRpb25UaW1lOiBuZXcgRGF0ZSgyMDE2LCAxLCAxKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdHViID0gc2lub24uc3R1YihhZGxDbGllbnQuZmlsZVN5c3RlbSwgXCJnZXRGaWxlU3RhdHVzXCIpLnJldHVybnMoZXhwZWN0ZWRSZXN1bHQpO1xyXG4gICAgICAgIGFkbE1vZHVsZSA9IG5ldyBBenVyZURhdGFMYWtlTW9kdWxlKFwiYWNjb3VudE5hbWVcIiwgXCJmb2xkZXJOYW1lXCIsIGFkbENsaWVudCwgXCJidWNrZXRcIik7XHJcblxyXG4gICAgICAgIC8vIEFjdFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFkbE1vZHVsZS5zaG91bGRVcGxvYWRUb0FETCh7IExhc3RNb2RpZmllZDogbmV3IERhdGUoKSwgS2V5OiBcImtleVwiIH0pO1xyXG5cclxuICAgICAgICAvLyBBc3NlcnRcclxuICAgICAgICBleHBlY3QocmVzdWx0KS50by5lcXVhbCh0cnVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkVXBsb2FkVG9BREwgcmV0dXJucyBmYWxzZSB3aGVuIHRoZSBmaWxlIGluIHMzIGlzIG5vdCBuZXdlciB0aGFuIHRoZSBmaWxlIGluIEFETFwiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLy8gZ2l2ZW5cclxuICAgICAgICBjb25zdCBleHBlY3RlZFJlc3VsdCA9IHtcclxuICAgICAgICAgICAgZmlsZVN0YXR1czoge1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpY2F0aW9uVGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdHViID0gc2lub24uc3R1YihhZGxDbGllbnQuZmlsZVN5c3RlbSwgXCJnZXRGaWxlU3RhdHVzXCIpLnJldHVybnMoZXhwZWN0ZWRSZXN1bHQpO1xyXG4gICAgICAgIGFkbE1vZHVsZSA9IG5ldyBBenVyZURhdGFMYWtlTW9kdWxlKFwiYWNjb3VudE5hbWVcIiwgXCJmb2xkZXJOYW1lXCIsIGFkbENsaWVudCwgXCJidWNrZXRcIik7XHJcblxyXG4gICAgICAgIC8vIEFjdFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFkbE1vZHVsZS5zaG91bGRVcGxvYWRUb0FETCh7IExhc3RNb2RpZmllZDogbmV3IERhdGUoMjAxNiwgMSwgMSksIEtleTogXCJrZXlcIiB9KTtcclxuXHJcbiAgICAgICAgLy8gQXNzZXJ0XHJcbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZXF1YWwoZmFsc2UpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGRVcGxvYWRUb0FETCByZXR1cm5zIHRydWUgd2hlbiBmaWxlIGRvZXMgbm90IGV4aXN0IGluIGFkbFwiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLy8gZ2l2ZW4gZXguYm9keS5yZW1vdGVFeGNlcHRpb24uZXhjZXB0aW9uXHJcbiAgICAgICAgbGV0IGZpbGVOb3RGb3VuZEV4Y2VwdGlvbiA9IHtcclxuICAgICAgICAgICAgYm9keToge1xyXG4gICAgICAgICAgICAgICAgcmVtb3RlRXhjZXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiBcIkZpbGVOb3RGb3VuZEV4Y2VwdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHN0dWIgPSBzaW5vbi5zdHViKGFkbENsaWVudC5maWxlU3lzdGVtLCBcImdldEZpbGVTdGF0dXNcIikudGhyb3dzKGZpbGVOb3RGb3VuZEV4Y2VwdGlvbik7XHJcbiAgICAgICAgYWRsTW9kdWxlID0gbmV3IEF6dXJlRGF0YUxha2VNb2R1bGUoXCJhY2NvdW50TmFtZVwiLCBcImZvbGRlck5hbWVcIiwgYWRsQ2xpZW50LCBcImJ1Y2tldFwiKTtcclxuXHJcbiAgICAgICAgLy8gQWN0XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYWRsTW9kdWxlLnNob3VsZFVwbG9hZFRvQURMKHsgTGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLCBLZXk6IFwia2V5XCIgfSk7XHJcblxyXG4gICAgICAgIC8vIEFzc2VydFxyXG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmVxdWFsKHRydWUpO1xyXG4gICAgfSk7XHJcbn0pOyJdLCJzb3VyY2VSb290IjoiLi4ifQ==
