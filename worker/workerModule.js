"use strict";

const backgrounder = require("backgrounder");
const path = require("path");
const winston = require("winston");

class Worker {

    constructor(conf) {
        this.config = conf;

        this.server = "";
        this.serverPort = 0;

        // conf.getTimeMangerServer().then((data) => {
        //     that.server = data;
        //     return that.conf.getTimeMangerServerPort();
        // }, (err) => {
        //     winston.error("Error loading TM-Server from db!");
        // }).then((data) => {
        //     that.serverPort = data;
        //     that.startHeartbeat(heartbeatCallback);
        // }, (err) => {
        //     winston.error("Error loading TM-Server Port from db!");
        // }); //55319;

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

        this.cardJob.on("message", function (msg) {
            //that.emit(msg.type, msg.payload);
            var data = JSON.parse(msg);
            if (data.type == "cardDetected") {
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

    startHeartbeat(fn) {
        var that = this;
        that.callback = fn;
        var workerFile = path.join(__dirname, "heartbeat", "heartbeat.js");
        this.heartbeatJob = backgrounder.spawn(workerFile);
        var job = {};
        job.task = "run";
        job.server = that.server;
        job.serverPort = that.serverPort;

        var jobStr = JSON.stringify(job);

        this.heartbeatJob.send(JSON.stringify(job), function (msg) {
            // winston.info("Backgrounder callback: " + msg);
        });

        this.heartbeatJob.on("message", function (msg) {
            //that.emit(msg.type, msg.payload);
            var data = JSON.parse(msg);
            if (data.type == "heartbeat") {
                //Aufbereiten cardid@diff
                var d = data.payload;
                that.callback(d);
            }
        });
    }

    stopHeartbeat() {
        var job = { "task": "stop" };
        var jobStr = JSON.stringify(job);
        this.heartbeatJob.send(JSON.stringify(job), function (msg) {
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