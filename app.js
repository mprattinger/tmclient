"use strict";

var winston = require("winston");

var logger = require("./logger");
var sockets = require("./sockets/sockets");
var httpServer = require("./server");
var hardware = require("./hardware");
// var cardCheckerMod = require("./cardChecker/checker");

var uiMod = require("./ui/ui");

global.rootDir = __dirname;

logger.configLogger();

winston.info("TMC gestartet!");

var ui = new uiMod();

var server = httpServer.runServer(ui);
var io = sockets.listen(server.server);
var hw = hardware.initHardware(io, ui);

ui.init(io);

// Catch CTRL+C
process.on('SIGINT', () => {
    if (worker) worker.stopCardChecker();
    console.log('\nCTRL+C...');
    process.exit(0);
});