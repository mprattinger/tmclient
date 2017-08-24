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
            if (err) {
                if (err.timeout) {
                    sendMessage("heartbeat-error", "timeout");
                } else {
                    sendMessage("heartbeat-error", err);
                }
            } else {
                if (res.text == "pong") {
                    sendMessage("heartbeat-ok", "ok");
                } else {
                    sendMessage("heartbeat-error", err);
                }
            }
            //Retry in 10 seconds
            timeout = setTimeout(() => {
                ping2(payload);
            }, 10000);
        });
}

function ping(payload) {
    //ping
    sendMessage("debug", "Sending ping to server...");
    var options = {};
    options.hostname = payload.server;
    options.port = payload.serverPort;
    options.path = "/ping";
    options.method = "GET";
    var req = http.request(options, function (res) {
        //Prepare Result
        var result = {};
        result.statusCode = res.statusCode;
        result.headers = res.headers;

        res.on("data", function (body) {
            sendMessage("debug", body);
            if (body == "pong") {
                sendMessage("heartbeat-ok", "ok");
                //Retry in 10 seconds
                timeout = setTimeout(() => {
                    ping(payload);
                }, 10000);
            }
        })
    });

    req.on("error", function (err) {
        sendMessage("heartbeat-error", err);
        //Retry in 10 seconds
        timeout = setTimeout(() => {
            ping(payload);
        }, 10000);
    });

    req.on("socket", function (socket) {
        socket.setTimeout(7000);
        socket.on("timeout", function () {
            sendMessage("heartbeat-error", "timeout");
            //Retry in 10 seconds
            timeout = setTimeout(() => {
                ping(payload);
            }, 10000);
        });
    });

    req.end();
}