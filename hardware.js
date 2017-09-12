"use strict";

var winston = require("winston");

var workerMod = require("./worker/workerModule");
var buzzerMod = require("./ui/registeredSound");

module.exports.initHardware = function (io, ui, db, tmService, conf) {
    var buzzer = new buzzerMod();
    var worker = new workerMod(conf);

    tmService.buzzer = buzzer;

    worker.loadConfig().then(ok => {
        worker.startCardChecker(function (uid) {
            io.emit("cardDetected", uid)

            winston.info("Card detected! Writing info...")
            //Show CardDetected
            ui.setSendCard();

            //Send the data to the server
            tmService.sendCard(uid, ui.getMode());
        });

        tmService.on("error", function (data) {
            //data kann ein Err-Objekt sein oder string
            if ((typeof data) == "string") {
                ui.setError("Fehler b. senden", data);
            } else {
                ui.setError("Fehler! Bitte", "kont. sie Admin");
            }
        });
        tmService.on("checkedIn", function (data) {
            //Employee sucessfully checked in or out -> Write info to lcd

            var name = data.firstName + " " + data.lastName;

            ui.setCheckIn(name, data.saldo);
            buzzer.playSound();
        });
        tmService.on("sendCard", function (data) {

        });

        setTimeout(function () {
            worker.startHeartbeat(function (stat, data) {
                ui.setHeartbeat(stat, data);
            });
        }, 2000);
    }, err => {
        winston.error(err);
    });
}