var winston = require("winston");
var path = require("path");
var fs = require("fs");

module.exports.configLogger = function () {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, { level: "info", colorize: true });

    var winstonLogDir = path.join(global.rootDir, "log");
    if (!fs.existsSync(winstonLogDir)) {
        //Erzeugen
        fs.mkdirSync(winstonLogDir);
    }
    winstonLogDir = path.join(winstonLogDir, "tmc.log");
    winston.add(require("winston-daily-rotate-file"), {
        filename: winstonLogDir,
        datePattern: ".dd-MM-yyyy",
        level: "info"
    });
}