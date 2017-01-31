var backgrounder = require("backgrounder");
var path = require("path");

module.exports.cardChecker = function () {
    var workerFile = path.join(__dirname, "cardChecker", "cardChecker.js");
    var cardJob = backgrounder.spawn(workerFile);
    var job = { "task": "run" };
    var jobStr = JSON.stringify(job);

    cardJob.send(JSON.stringify(job), function (msg) {
        winston.info("Backgrounder callback: " + msg);
    });

    return cardJob;
    // cardJob.on("message", function (data) {
    //     winston.info("Message from cardChecker received!");
    //     // var payload = JSON.parse(data);

    //     // socketServer.emit("cardDetected", data);
    // });
}