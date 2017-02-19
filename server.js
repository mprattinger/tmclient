"use strict";

var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var os = require("os");
var winston = require("winston");
var fs = require("fs");
var routesMod = require("./routes")
var sockets = require("./sockets/sockets");

module.exports.runServer = function (ui, db, tmService) {
    var app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, "public")));

    app.use('/lib', express.static(__dirname + '/bower_components'));
    app.use('/lib2', express.static(__dirname + '/node_modules'));

    app.use((req, res, next) => {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", "0");
        next();
    });

    app.use((req, res, next) => {
        var body = null;
        if (req.body) body = req.body;
        winston.log("info", req.url, { url: req.url, method: req.method, body: body });
        next();
    });

    //Routes
    var routes = new routesMod(ui, db, tmService);
    app.use("/api", routes.router);

    app.use((req, res, next) => {
        var err = new Error("Not found");
        res.status(404);
        next(err);
    });

    var port = process.env.PORT || 8080;

    app.set("port", port);
    var server = app.listen(app.get("port"), () => {
        winston.log("info", "Express server listening on port " + server.address().port);
    });

    return {
        "expressApp": app,
        "server": server
    };

    // var socketServer = sockets.listen(server);
}
