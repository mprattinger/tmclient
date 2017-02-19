"use strict";

var winston = require("winston");

var logger = require("./logger");
var sockets = require("./sockets/sockets");
var httpServer = require("./server");
var hardware = require("./hardware");
var dbMod = require("./services/databaseService");
var configService = require("./services/conifgService");
// var cardCheckerMod = require("./cardChecker/checker");
var tmServiceMod = require("./services/timeManagerServerService");

var uiMod = require("./ui/ui");

global.rootDir = __dirname;

var ui = new uiMod();
var db = new dbMod();
var conf = new configService();
var tmService = new tmServiceMod(db, conf);

logger.configLogger();

winston.info("TMC gestartet!");

var server = httpServer.runServer(ui, db, tmService);
var io = sockets.listen(server.server);
var hw = hardware.initHardware(io, ui, db, tmService);

logger.configSocketLogger(io);

ui.init(io);

// Catch CTRL+C
process.on('SIGINT', () => {
    if (worker) worker.stopCardChecker();
    console.log('\nCTRL+C...');
    process.exit(0);
});