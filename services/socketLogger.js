"use strict";

var winston = require("winston");
var utils = require("util");

var SocketLogger = exports.SocketLogger = function(options){
    if(options){
        if(!options.io){
            throw new Error("SocketLogger requires Socket.IO object!");
        }else{
            this.io = options.io;
        }
    }  else {
         throw new Error("SocketLogger requires Socket.IO object!");
    }
};
utils.inherits(SocketLogger, winston.Transport);
winston.transports.SocketLogger = SocketLogger;

SocketLogger.prototype.log = function(level, message, metadata, callback){
    var that = this;
    var payload = {};
    payload.level = level;
    payload.message = message;
    that.io.emit("newlogentry", payload);
}

// class SocketLogger extends winston.Transport{

//     constructor(io){
//         super();
//         this.name = "socketLogger";
//         this.level = "info";
//         // this._io = io;
//     }

//     log(level, message, metadata, callback){
//         console.log(message);
//     }
// }

// winston.add(SocketLogger);

// module.exports = SocketLogger;