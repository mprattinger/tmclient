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

        //this.loadConfig();
    }

    loadConfig() {
        var that = this;
        return new Promise((res, rej) => {
            that.conf.getAllSettings().then((data) => {
                that.server = data.server.servername;
                that.serverPort = data.server.serverport;
                that.tmApiUrl = data.server.tmapi;
                that.empApiUrl = data.server.empapi;
                res(data);
            }, (err) => {
                rej(err);
            });
        });
    }

    sendCard(cardId, inverted) {
        var that = this;
        
        that.emit("sendCard");
        
        that.loadConfig().then(function () {
            winston.info("Sendung CardId " + cardId + " with go is " + inverted + "!");
            //Build payload
            var payload = {};
            payload.TagUid = cardId;
            if (!inverted) {
                payload.InOut = "Out";
            } else {
                payload.InOut = "In";
            }
            winston.info("Go " + inverted + " is translated to " + payload.InOut);

            //Prepare request
            that.options = {};
            that.options.hostname = that.server;
            that.options.port = that.serverPort;
            that.options.path = that.tmApiUrl;
            that.options.method = "POST"
            that.options.headers = {
                "Content-Type": "application/json"
            };
            winston.info("HTTP Request options: " + JSON.stringify(that.options));
            winston.info("Sending request with payload " + JSON.stringify(payload));
            that.postRequest(payload).then(function (data) {
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
                that.emit("error", err);
            });
        });
    }

    getEmployees() {
        var that = this;
        var deferred = q.defer();

        winston.info("Loading employees from TimeManager-Server!");

        this.loadConfig().then(function () {
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
        });
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

        req.on("socket", function(socket){
            socket.setTimeout(7000);
            socket.on("timeout", function(){
                deferred.reject("Timeout");
            });
        });

        //Send data to server
        req.write(JSON.stringify(data));
        req.end();
        return deferred.promise;
    }
}

module.exports = TimeManagerServerService;