import * as path from "path";
import { transports, Logger } from "winston";

const tempFolder = process.env.TEMP_FOLDER || ".";

export let winston = new Logger({
  transports: [
    new transports.Console(),
    new transports.File({
      filename: tempFolder + "/logfile.log",
      level: "verbose",
      colorize: true,
      timestamp: true,
    }),
  ],
});

winston.remove(transports.Console);
winston.add(transports.Console, {
  timestamp: true,
  level: "info",
  colorize: true,
});