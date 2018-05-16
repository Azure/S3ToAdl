import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as socketIo from "socket.io";
import * as watch from "watchjs";
import { winston } from "./logger";
import { S3ToAdlDataCopy } from "./s3ToAdlDataCopy";

const app: express.Application = express();
const server = http.createServer(app);
const port: number = process.env.PORT || 4200;
const io = socketIo(server).listen(server);

server.listen(port, () => {
    console.log("Running server on port %s", port);
});

const s3ToAdlDataCopy = new S3ToAdlDataCopy();
s3ToAdlDataCopy.handler(() => {
    server.close();
    process.exit();
});

app.use(express.static(path.resolve(__dirname + "/public")));

app.get("/", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + "/index.html"));
});

io.on("connection", function (socket) {
    winston.verbose("Connected successfully to the socket ...");
    io.sockets.emit("batchChange", s3ToAdlDataCopy.copyProperties);
});

watch.watch(s3ToAdlDataCopy.copyProperties, ["batchNumber", "uploadedCount"], () => {
    io.sockets.emit("batchChange", s3ToAdlDataCopy.copyProperties);
});

winston.stream().on("log", function (log) {
    io.sockets.emit("log", log);
});