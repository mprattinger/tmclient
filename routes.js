"use strict";

class Routes {

    constructor(ui, db) {
        this.ui = ui;
        this.db = db;
        this.router = require('express').Router();

        this._createRoutes();
    }

    _createRoutes() {
        var that = this;
        that.router.route("/ping").get(function (req, res) {
            res.statusCode = 200;
            res.send("pong");
        });

        that.router.route("/changeStatus").post(function (req, res) {
            that.ui.changeStatus();
            res.statusCode = 200;
        });

        that.router.route("/simulateCard").post(function (req, res) {
            // ui.changeStatus();
            res.statusCode = 200;
        });

        that.router.route("/getMissingCards").get((req, res) => {
            that.db.getUnknownCards().then((data) => {
                res.statusCode = 200;
                res.send(data);
            }, (err) => {

            });
        });
    }
}

module.exports = Routes;
