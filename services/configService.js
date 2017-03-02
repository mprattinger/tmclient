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
                ret[String(element.group)] = ret[String(element.group)] || {};

                ret[String(element.group)][String(element.setting)] = element.value;
            }, this);

            deferred.resolve(ret);
        });

        return deferred.promise;
    }

    saveServerSettings(data) {
        return this.saveSetting("server", "servername", data.servername).then(
            () => {
                return this.saveSetting("server", "serverport", data.serverport);
            }
        ).then(
            () => {
                return this.saveSetting("server", "tmapi", data.tmapi);
            }
            ).then(
            () => {
                return this.saveSetting("server", "empapi", data.empapi);
            }
            );
    }

    saveLcdSettings(data) {
        return this.saveSetting("lcd", "splashline1", data.splashline1).then(
            () => {
                return this.saveSetting("lcd", "splashline2", data.splashline2);
            }
        ).then(()=>{
            return this.saveSetting("lcd", "splashshowtime", data.splashshowtime)   
        }).then(()=>{
            return this.saveSetting("lcd", "statusswitchtimeout", data.statusswitchtimeout)   
        }).then(()=>{
            return this.saveSetting("lcd", "checkintimeout", data.checkintimeout)   
        }).then(()=>{
            return this.saveSetting("lcd", "statusgo", data.statusgo)   
        }).then(()=>{
            return this.saveSetting("lcd", "statuscome", data.statuscome)   
        });
    }

    getTimeMangerServer() {
        return this.loadSetting("server", "servername");
    }

    getTimeMangerServerPort() {
        return this.loadSetting("server", "serverport");
    }

    getTimeMangerServerApi() {
        return this.loadSetting("server", "tmapi");
    }

    getTimeMangerServerEmployeeApi() {
        return this.loadSetting("server", "empapi");
    }

    getLcdSplashLine1() {
        return this.loadSetting("lcd", "splashline1");
    }

    getLcdSplashLine2() {
        return this.loadSetting("lcd", "splashline2");
    }

    getLcdSplashShowTime() {
        return this.loadSetting("lcd", "splashshowtime");
    }

    getLcdSwitchTimeout() {
        return this.loadSetting("lcd", "statusswitchtimeout");
    }

    getLcdCheckInTimeout() {
        return this.loadSetting("lcd", "checkintimeout");
    }

    getLcdGoText() {
        return this.loadSetting("lcd", "statusgo");
    }

    getLcdComeText() {
        return this.loadSetting("lcd", "statuscome");
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

            // winston.info("Found setting " + res + " in database");
            if (res) {
                deferred.resolve(res.value);
            }
        });

        return deferred.promise;
    }

    saveSetting(group, setting, value) {
        var that = this;
        var deferred = q.defer();

        winston.info("Save setting " + setting + " with value " + value + " for group " + group);
        this.db.update({ "group": group, "setting": setting }, { $set: { "value": value } }, {}, (err, repl) => {
            if (err) {
                winston.error("Error updating setting for group " + group + ", setting " + setting + " with value " + value, err);
                deferred.reject(err);
                return;
            }

            //Wenn repl (aktualisierte Dokumente) 0 ist, dann wurde nicht geupdated, weil kein Dokument gefunden wurder -> daher ein Insert machen
            if (repl == 0) {
                winston.info("Setting not in db -> insert required!");
                var doc = {};
                doc.group = group;
                doc.setting = setting;
                doc.value = value;
                that.db.insert(doc, (err, newdoc) => {
                    if (err) {
                        winston.error("Error inserting setting for group " + group + ", setting " + setting + " with value " + value, err);
                        deferred.reject(err);
                        return;
                    }
                    winston.info("Setting inserted!");
                    deferred.resolve(repl);
                });
            } else {
                winston.info("Setting updated!");
                deferred.resolve(repl);
            }
        });

        return deferred.promise;
    }
}

module.exports = ConfigService;