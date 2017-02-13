"use strict";

var http = require("http");
var q = require("q");
var winston = require("winston");
var events = require("events");

class TimeManagerServerService extends events.EventEmitter {

    constructor(db) {
        super();

        //Serveradresse laden -> TODO
        this.server = "localhost";
        this.serverPort = 55319;
        this.apiUrl = "/api/timemanager";

        this.db = db;
    }

    sendCard(cardId, go) {
        var that = this;

        winston.info("Sendung CardId " + cardId + " with go is " + go + "!");
        //Build payload
        var payload = {};
        payload.cardId = cardId;
        if (go) {
            payload.mode = "Out";
        } else {
            payload.mode = "In";
        }
        winston.info("Go " + go + " is translated to " + payload.mode);

        //Prepare request
        this.options = {};
        this.options.hostname = this.server;
        this.options.port = this.serverPort;
        this.options.path = this.apiUrl;
        this.options.method = "POST"
        this.options.headers = {
            "Content-Type": "application/json"
        };
        winston.info("HTTP Request options: " + JSON.stringify(this.options));
        winston.info("Sending request with payload " + JSON.stringify(payload));
        this.postRequest(payload).then(function (data) {
            switch (data.statusCode) {
                case 200:
                    //User wurde ein/ausgecheckt
                    winston.info("Received Ok from the server with data " + JSON.stringify(data.data));
                    //Info anzeigen
                    that.emit("checkedIn", data.data);
                    break;
                case 400:
                    winston.error("Bad request send to server");
                    that.emit("error", "Bad request send to server");
                    break;
                case 404:
                    //Die CardId wurde in der Datenbank nicht gefunden und konnte keinen Mitarbeiter zugeordnet werden
                    winston.warn("CardID was not found in db and no employee could be determined!");
                    //CardId merken
                    that.db.storeUnknownCard(cardId);
                    break;
                default:
                    winston.error("StatusCode " + data.statusCode + " not processed!");
                    //deferred.reject("StatusCode not processed -> " + data.statusCode);
                    that.emit("error", "StatusCode not processed -> " + data.statusCode);
                    break;
            }
        }, function (err) {
            // deferred.reject(err);
            this.emit("error", err);
        });
    }

    postRequest(data) {
        var deferred = q.defer();
        var req = http.request(this.options, function (res) {
            //Prepare Result
            var result = {};
            result.statusCode = res.statusCode;
            result.headers = res.headers;

            res.on("data", function (body) {
                try {
                    res.data = JSON.parse(body);
                } catch (e) {
                    res.data = body;
                }
                // console.log("Body: " + body);
                // var ret = {};
                // ret.statusCode = res.statusCode;
                // ret.headers = res.headers;
                // if (body) {
                //     ret.data = JSON.parse(body);
                // }
                // deferred.resolve(ret);
            })

            res.on("end", function () {
                deferred.resolve(result);
            })

            // console.log("Status: " + res.statusCode);
            // console.log("Headers: " + JSON.stringify(res.headers));
            // res.setEncoding("utf8");
            // res.on("data", function (body) {
            //     console.log("Body: " + body);
            //     var ret = {};
            //     ret.statusCode = res.statusCode;
            //     ret.headers = res.headers;
            //     if (body) {
            //         ret.data = JSON.parse(body);
            //     }
            //     deferred.resolve(ret);
            // })
        });
        req.on("error", function (err) {
            deferred.reject(err);
        });

        //Send data to server
        req.write(JSON.stringify(data));
        req.end();
        return deferred.promise;
    }
}

module.exports = TimeManagerServerService;