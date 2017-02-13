"use strict";

const backgrounder = require("backgrounder");
const path = require("path");

class Worker{

    constructor() {
    }

    startCardChecker(fn) {
        var that = this;
        that.callback = fn;
        var workerFile = path.join(__dirname, "cardChecker", "cardChecker.js");
        this.cardJob = backgrounder.spawn(workerFile);
        var job = { "task": "run" };
        var jobStr = JSON.stringify(job);

        this.cardJob.send(JSON.stringify(job), function (msg) {
            // winston.info("Backgrounder callback: " + msg);
        });

        this.cardJob.on("message", function(msg){
             //that.emit(msg.type, msg.payload);
             var data = JSON.parse(msg);
             if(data.type == "cardDetected") {
                 //Aufbereiten cardid@diff
                 var d = data.payload;
                 var parts = d.split("@");
                 that.callback(parts[0]);
             }
        });
    }

    stopCardChecker() {
        var job = { "task": "stop" };
        var jobStr = JSON.stringify(job);
        this.cardJob.send(JSON.stringify(job), function (msg) {
            // winston.info("Backgrounder callback: " + msg);
        });
    }
}

module.exports = Worker;

// module.exports.cardChecker = function () {
//     var workerFile = path.join(__dirname, "cardChecker", "cardChecker.js");
//     var cardJob = backgrounder.spawn(workerFile);
//     var job = { "task": "run" };
//     var jobStr = JSON.stringify(job);

//     cardJob.send(JSON.stringify(job), function (msg) {
//         winston.info("Backgrounder callback: " + msg);
//     });

//     return cardJob;
// }