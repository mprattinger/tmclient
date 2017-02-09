var winston = require("winston");

var logger = require("./logger");
var httpServer = require("./server");
var workerMod = require("./worker/workerModule");
// var cardCheckerMod = require("./cardChecker/checker");
var sockets = require("./sockets/sockets");
var uiMod = require("./ui/ui");

global.rootDir = __dirname;

logger.configLogger();

winston.info("TMC gestartet!");

var worker = new workerMod();

// var cardChecker = new cardCheckerMod();
// cardChecker.init();
// cardChecker.checkCard();
var ui = new uiMod();
ui.init();

var server = httpServer.runServer(ui);
var io = sockets.listen(server.server);

worker.startCardChecker(function(uid){
    io.emit("cardDetected", uid)
});

ui.on("lcdUpdated", function(uiData){
    io.emit("lcdUpdated", uiData);
});
ui.on("statusButtonPressed", function(){
    io.emit("statusButtonPressed");
})

// Catch CTRL+C
process.on ('SIGINT', () => {
    if(worker) worker.stopCardChecker();
  console.log ('\nCTRL+C...');
  process.exit (0);
});