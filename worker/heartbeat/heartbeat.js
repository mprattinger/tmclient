"use strict";

var http = require("http");

process.on("message", function (data, cb) {
    var payload = JSON.parse(data);
    switch (payload.task) {
        case "run":
            //ping
            var options = {};
            options.hostname = data.server;
            options.port = data.serverPort;
            options.path = "/ping";
            options.method = "GET";
            http.request(options, function (res) {
                //Prepare Result
                var result = {};
                result.statusCode = res.statusCode;
                result.headers = res.headers;

                res.on("data", function (body) {
                    if (body == "pong") {
                        sendMessage("heartbeat", result);
                    }
                })
            });
            var interval = setInterval(function () {
                http.request(options, function (res) {
                    //Prepare Result
                    var result = {};
                    result.statusCode = res.statusCode;
                    result.headers = res.headers;

                    res.on("data", function (body) {
                        if (body == "pong") {
                            sendMessage("heartbeat", result);
                        }
                    })
                });
            }, 600000)
            break;
        case "stop":
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