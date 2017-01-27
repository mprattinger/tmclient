module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.route("/ping").get(function(req, res){
        res.statusCode(200);
        res.send("pong");
    });

    return router;
})();