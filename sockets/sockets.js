var ioMod = require("socket.io");
var winston = require("winston");

module.exports.listen = function(server){
    var io = ioMod.listen(server);

    io.on("connect", function(socket){
        winston.info("Client connected!");

        socket.on("test", function(data){
            winston.info("Test received!");
        });

    });

    return io;
}
