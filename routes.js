"use strict";

class Routes {

    constructor(ui) {
        this.ui = ui;
        this.router = require('express').Router();  

        this._createRoutes();
    }

    _createRoutes() {
        var that = this;
        that.router.route("/ping").get(function (req, res) {
            res.statusCode(200);
            res.send("pong");
        });

        that.router.route("/changeStatus").post(function(req, res){
            ui.changeStatus();
            res.statusCode(200);
        });

        that.router.route("/simulateCard").post(function(req, res){
            // ui.changeStatus();
            res.statusCode(200);
        });
    }
}

module.exports = Routes;



// module.exports = (function () {
//     'use strict';
//     var router = require('express').Router();

//     router.route("/ping").get(function (req, res) {
//         res.statusCode(200);
//         res.send("pong");
//     });

//     return router;
// })();