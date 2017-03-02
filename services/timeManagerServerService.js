"use strict";

var http = require("http");
var q = require("q");
var winston = require("winston");
var events = require("events");

class TimeManagerServerService extends events.EventEmitter {

    constructor(db, conf) {
        super();
        var that = this;
        this.db = db;
        this.conf = conf;

        //Serveradresse laden
        this.server = "";
        this.serverPort = 0;
        this.tmApiUrl = "";
        this.empApiUrl = "";

        conf.getTimeMangerServer().then((data) => {
            that.server = data;
        }, (err) => {
            winston.error("Error loading TM-Server from db!");
        });
        conf.getTimeMangerServerPort().then((data) => {
            that.serverPort = data;
        }, (err) => {
            winston.error("Error loading TM-Server Port from db!");
        }); //55319;
        conf.getTimeMangerServerApi().then((data) => {
            that.tmApiUrl = data;
        }, (err) => {
            winston.error("Error loading TimeManager API path from db!");
        }); //"/api/timemanager";
        conf.getTimeMangerServerEmployeeApi().then((data) => {
            that.empApiUrl = data;
        }, (err) => {
            winston.error("Error loading TimeManager-Server employee API path from db!");
        }); //"/api/employees";
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
        this.options.path = this.tmApiUrl;
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

    getEmployees() {
        var that = this;
        var deferred = q.defer();

        winston.info("Loading employees from TimeManager-Server!");

        //Prepare request
        this.options = {};
        this.options.hostname = this.server;
        this.options.port = this.serverPort;
        this.options.path = this.empApiUrl;
        this.options.method = "GET";
        this.options.headers = {
            "Content-Type": "application/json"
        };
        winston.info("HTTP Request options: " + JSON.stringify(this.options));
        this.getRequest().then(function (data) {
            switch (data.statusCode) {
                case 200:
                    //Mitarbeiter geladen
                    winston.info("Received Ok from the server with data " + JSON.stringify(data.data));
                    //Daten zurücksenden
                    deferred.resolve(data.data);
                    break;
                case 400:
                    winston.error("Bad request send to server");
                    deferred.reject("Bad request send to server");
                    break;
                default:
                    winston.error("StatusCode " + data.statusCode + " not processed!");
                    //deferred.reject("StatusCode not processed -> " + data.statusCode);
                    deferred.reject("StatusCode not processed -> " + data.statusCode);
                    break;
            }
        }, function (err) {
            // deferred.reject(err);
            this.emit("error", err);
        });
        return deferred.promise;
    }

    getRequest() {
        var deferred = q.defer();
        var req = http.request(this.options, function (res) {
            //Prepare Result
            var result = {};
            result.statusCode = res.statusCode;
            result.headers = res.headers;

            res.on("data", function (body) {
                try {
                    result.data = JSON.parse(body);
                } catch (e) {
                    result.data = body;
                }
            })

            res.on("end", function () {
                deferred.resolve(result);
            })
        });
        req.on("error", function (err) {
            deferred.reject(err);
        });

        //Send data to server
        req.end();
        return deferred.promise;
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
                    result.data = JSON.parse(body);
                } catch (e) {
                    result.data = body;
                }
            })

            res.on("end", function () {
                deferred.resolve(result);
            })
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