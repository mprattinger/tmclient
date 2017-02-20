"use strict";

var nedb = require("nedb");
var path = require("path");
var q = require("q");
var winston = require("winston");

class ConfigService {

    constructor() {
        this._dbPath = path.join(global.rootDir, "data", "settings.db");
        this.db = new nedb({
            "filename": this._dbPath,
            "autoload": true
        });

        // this.configFile = path.join(global.rootDir, "config.json");

        // nconf
        //     .env()
        //     .argv()
        //     .file(this.configFile);


        // var demo = {};
        // demo.group = "server";
        // demo.setting = "servername";
        // demo.value = "localhost";
        // this.db.insert(demo);
        // demo = {};
        // demo.group = "server";
        // demo.setting = "serverport";
        // demo.value = "55319";
        // this.db.insert(demo);
        // demo = {};
        // demo.group = "server";
        // demo.setting = "tmapi";
        // demo.value = "/api/timemanager";
        // this.db.insert(demo);
        // demo = {};
        // demo.group = "server";
        // demo.setting = "empapi";
        // demo.value = "/api/employees";
        // this.db.insert(demo);
    }

    getAllSettings() {
        var deferred = q.defer();

        winston.info("Load all settings from database!");

        this.db.find({}, (err, res) => {
            if (err) {
                winston.error("Error loading all settings from the store!", err);
                deferred.reject(err);
                return;
            }
            winston.info("Found " + res.length + " settings items in database!");

            //Build Settingsreturn
            var ret = {};
            res.forEach(function (element) {
                if (!element.group in ret) {
                    ret[element.group.tostring()] = element.group;
                }
                ret[element.group.tostring() + "." + element.setting.tostring()] = element.value;


                // if(ret[element.group.tostring()] == null)
                // switch (element.group) {
                //     case "server":
                //         switch (element.setting) {
                //             case "servername":
                //                 break;
                //             case "serverport":
                //                 break;
                //             case "tmapi":
                //                 break;
                //             case "empapi":
                //                 break;
                //         }
                //         break;
                //     case "lcd":
                //         break;
                // }
            }, this);

            deferred.resolve(res);
        });

        return deferred.promise;
    }

    getTimeMangerServer() {
        return this.loadSetting("server", "servername");
    }

    getTimeMangerServerPort() {
        return this.loadSetting("server", "serverport");
    }

    getTimeMangerServerApi() {
        return this.loadSetting("server", "tmapi");
        // return "/api/timemanager";
    }

    getTimeMangerServerEmployeeApi() {
        return this.loadSetting("server", "empapi");
        // return "/api/employees";
    }


    loadSetting(group, setting) {
        var deferred = q.defer();

        winston.info("Load setting " + setting + " from group " + group + " from database!");

        this.db.findOne({ "group": group, "setting": setting }, (err, res) => {
            if (err) {
                winston.error("Error loading setting " + setting + " from group " + group + " out of the store!", err);
                deferred.reject(err);
                return;
            }

            winston.info("Found setting " + res + " in database");
            deferred.resolve(res);
        });

        return deferred.promise;
    }

}

module.exports = ConfigService;