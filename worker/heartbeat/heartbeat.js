"use strict";

var http = require("http");
var sa = require("superagent");
var timeout = null;

process.on("message", function (data, cb) {
    var payload = JSON.parse(data);
    switch (payload.task) {
        case "run":
            ping2(payload);
            // interv = setInterval(function () {
            //     ping(payload);
            // }, 5000)
            break;
        case "stop":
            clearInterval(interv);
            break;
    }
});

function sendMessage(type, data) {
    var msg = {};
    msg.type = type;
    msg.payload = data;
    var payl = JSON.stringify(msg);
    process.send(payl);
}

function ping2(payload) {
    var path = payload.server + ":"
        + payload.serverPort + "/ping";
    sendMessage("debug", "Sending ping to server " + path);
    sa.get(path)
        .timeout({ "response": 5000, deadline: 7000 })
        .end((err, res) => {
            var retry = 30000;
            if (err) {
                if (err.timeout) {
                    sendMessage("heartbeat-error", "timeout");
                    retry = 10000;
                } else {
                    sendMessage("heartbeat-error", err);
                    retry = 10000;
                }
            } else {
                if (res.text == "pong") {
                    sendMessage("heartbeat-ok", "ok");
                } else {
                    sendMessage("heartbeat-error", err);
                    retry = 10000;
                }
            }
            //Retry in 10 seconds
            timeout = setTimeout(() => {
                ping2(payload);
            }, retry);
        });
}