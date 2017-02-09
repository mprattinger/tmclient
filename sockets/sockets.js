var ioMod = require("socket.io");
var winston = require("winston");
var os = require("os");
var dns = require('dns')

module.exports.listen = function (server) {
    var io = ioMod.listen(server);

    io.on("connect", function (socket) {
        winston.info("Client connected!");

        socket.on("test", function (data) {
            winston.info("Test received!");
        });

        socket.on("getSystemInfo", function (name, fn) {
            var ret = {};
            ret.os = os.platform();
            ret.host = (os.hostname());

            var interfaces = os.networkInterfaces();
            var addresses = [];
            for (var k in interfaces) {
                for (var k2 in interfaces[k]) {
                    var address = interfaces[k][k2];
                    if (address.family === 'IPv4' && !address.internal) {
                        addresses.push(address.address);
                    }
                }
            }
            ret.ips = addresses;
            socket.emit("systemInfo", ret);
        });
    });

    return io;
}
