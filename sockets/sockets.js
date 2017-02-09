var ioMod = require("socket.io");
var winston = require("winston");
var os = require("os");
var dns = require('dns')

module.exports.listen = function(server){
    var io = ioMod.listen(server);

    io.on("connect", function(socket){
        winston.info("Client connected!");

        socket.on("test", function(data){
            winston.info("Test received!");
        });

        socket.on("getSystemInfo", function(name, fn){
            var ret = {};
            ret.os = os.platform();
            ret.host = (os.hostname());
            socket.emit("systemInfo", ret);
        });
    });

    return io;
}
