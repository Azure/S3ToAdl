"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const tempFolder = process.env.TEMP_FOLDER || ".";
exports.winston = new winston_1.Logger({
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({
            filename: tempFolder + "/logfile.log",
            level: "verbose",
            colorize: true,
            timestamp: true,
        }),
    ],
});
exports.winston.remove(winston_1.transports.Console);
exports.winston.add(winston_1.transports.Console, {
    timestamp: true,
    level: "info",
    colorize: true,
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxQ0FBNkM7QUFFN0MsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDO0FBRXZDLFFBQUEsT0FBTyxHQUFHLElBQUksZ0JBQU0sQ0FBQztJQUM5QixVQUFVLEVBQUU7UUFDVixJQUFJLG9CQUFVLENBQUMsT0FBTyxFQUFFO1FBQ3hCLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFDbEIsUUFBUSxFQUFFLFVBQVUsR0FBRyxjQUFjO1lBQ3JDLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQztLQUNIO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsZUFBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLGVBQU8sQ0FBQyxHQUFHLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUU7SUFDOUIsU0FBUyxFQUFFLElBQUk7SUFDZixLQUFLLEVBQUUsTUFBTTtJQUNiLFFBQVEsRUFBRSxJQUFJO0NBQ2YsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9sb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IHRyYW5zcG9ydHMsIExvZ2dlciB9IGZyb20gXCJ3aW5zdG9uXCI7XHJcblxyXG5jb25zdCB0ZW1wRm9sZGVyID0gcHJvY2Vzcy5lbnYuVEVNUF9GT0xERVIgfHwgXCIuXCI7XHJcblxyXG5leHBvcnQgbGV0IHdpbnN0b24gPSBuZXcgTG9nZ2VyKHtcclxuICB0cmFuc3BvcnRzOiBbXHJcbiAgICBuZXcgdHJhbnNwb3J0cy5Db25zb2xlKCksXHJcbiAgICBuZXcgdHJhbnNwb3J0cy5GaWxlKHtcclxuICAgICAgZmlsZW5hbWU6IHRlbXBGb2xkZXIgKyBcIi9sb2dmaWxlLmxvZ1wiLFxyXG4gICAgICBsZXZlbDogXCJ2ZXJib3NlXCIsXHJcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxyXG4gICAgICB0aW1lc3RhbXA6IHRydWUsXHJcbiAgICB9KSxcclxuICBdLFxyXG59KTtcclxuXHJcbndpbnN0b24ucmVtb3ZlKHRyYW5zcG9ydHMuQ29uc29sZSk7XHJcbndpbnN0b24uYWRkKHRyYW5zcG9ydHMuQ29uc29sZSwge1xyXG4gIHRpbWVzdGFtcDogdHJ1ZSxcclxuICBsZXZlbDogXCJpbmZvXCIsXHJcbiAgY29sb3JpemU6IHRydWUsXHJcbn0pOyJdLCJzb3VyY2VSb290IjoiLi4ifQ==
