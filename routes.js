"use strict";

class Routes {

    constructor(ui, db, tmService, settings) {
        this.ui = ui;
        this.db = db;
        this.tmService = tmService;
        this.settings = settings;
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

        that.router.route("/getMissingCard/:id").get((req, res) => {
            if (req.params.id) {
                that.db.getUnknownCard(req.params.id).then((data) => {
                    if (data) {
                        res.statusCode = 200;
                        res.send(data);
                    }
                }, (err) => {
                    res.statusCode = 500;
                });
            } else {
                res.statusCode = 404;
            }
        });

        that.router.route("/loadEmployees").get((req, res) => {
            that.tmService.getEmployees().then((data) => {
                res.statusCode = 200;
                res.send(data);
            }, (err) => {
                res.statusCode = 500;
            });
        });

        that.router.route("/loadAllSettings").get((req, res) => {
        
        });
    }
}

module.exports = Routes;
