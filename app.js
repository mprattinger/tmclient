var winston = require("winston");

var logger = require("./logger");
var httpServer = require("./server");
var worker = require("./workers/workerModule");
var sockets = require("./sockets/sockets");

global.rootDir = __dirname;

logger.configLogger();

winston.info("TMC gestartet!");

var server = httpServer.runServer();
var cardJob = worker.cardChecker();
var io = sockets.listen(server.server);

process.stdin.resume();
process.on("exit", function (code) {
    console.log('Process exit');

    var job = { "task": "stop" };
    var jobStr = JSON.stringify(job);
    cardJob.send(JSON.stringify(job), function (msg) {
        winston.info("Backgrounder callback: " + msg);
    });

    process.exit(code);
});

// Catch CTRL+C
process.on ('SIGINT', () => {
  console.log ('\nCTRL+C...');
  process.exit (0);
});