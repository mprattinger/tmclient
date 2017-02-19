"use strict";

var winston = require("winston");

var workerMod = require("./worker/workerModule");

module.exports.initHardware = function (io, ui, db, tmService) {
    var worker = new workerMod();
    
    worker.startCardChecker(function (uid) {
        io.emit("cardDetected", uid)
        //Send the data to the server
        tmService.sendCard(uid, ui.go);
    });

    tmService.on("error", function (data) {
        //data kann ein Err-Objekt sein oder string
        if((typeof data) == "string"){

        } else {

        }
    });
    tmService.on("checkedIn", function (data) {
        //Employee sucessfully checked in or out -> Write info to lcd
        ui.empCheckedIn(data);
    });
}