var winston = require("winston");

var logger = require("./logger");
var httpServer = require("./server");
// var worker = require("./workers/workerModule");
var cardCheckerMod = require("./cardChecker/checker");
var sockets = require("./sockets/sockets");
var uiMod = require("./ui/ui");

global.rootDir = __dirname;

logger.configLogger();

winston.info("TMC gestartet!");

var server = httpServer.runServer();
// var cardJob = worker.cardChecker();
var cardChecker = new cardCheckerMod();
cardChecker.init();
// cardChecker.checkCard();
var ui = new uiMod();
ui.init();
var io = sockets.listen(server.server);

cardChecker.on("cardDetected", function(uid){
    io.emit("cardDetected", uid);
})
ui.on("lcdUpdated", function(uiData){
    io.emit("lcdUpdated", uiData);
});
ui.on("statusButtonPressed", function(){
    io.emit("statusButtonPressed");
})

// Catch CTRL+C
process.on ('SIGINT', () => {
  console.log ('\nCTRL+C...');
  process.exit (0);
});