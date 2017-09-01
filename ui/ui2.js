"use strict";

var events = require("events");
var q = require("q");
var dateFormat = require("dateformat");
var os = require("os");
var winston = require("winston");
var lcdMod = null;
var btnMod = null;
if (os.platform() == "linux") {
    lcdMod = require("lcd");
    btnMod = require("./statusButton");
} else {
    lcdMod = require("./lcdMock");
    btnMod = require("./statusButtonMock");
}

class Ui extends events.EventEmitter {

    constructor(conf) {
        super();
        var that = this;
        this.conf = conf;

        this.dirty = false;
        this.line1 = "";
        this.line2 = "";

        this.errorMs = 10000;

        this._buildViews();

        that.btn = new btnMod();
        that.btn.init();

        that.btn.on("statusButtonPressed", function () {
            that.emit("statusButtonPressed");
            that.setInverted();
        })
    };

    init(io) {
        var that = this;
        var deferred = q.defer();
        that.io = io;

        that._loadConfig()
            .then(that._initLcd())
            .then(() => {
                //MainLoop
                winston.info("Starting lcd mainloop...")
                setInterval(() => {
                    //Mal die Zeit in die erste Zeile schreiben
                    var line1 = that._getTimeLine();
                    var line2 = "";
                    //Entscheidungsbaum abfragen
                    if (that._check_inverted()) {
                        line2 = that.views.inv_mode.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2)
                    } else if (that._check_splash()) {
                        line1 = that.views.splash.line1;
                        line2 = that.views.splash.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2);
                    } else if (that._check_checkin()) {
                        line1 = that.views.check_in.line1;
                        line2 = that.views.check_in.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2)
                    } else if (that._check_error()) {
                        line1 = that.views.error.line1;
                        line2 = that.views.error.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2)
                    } else if (that._check_sendCard_active()){
                        line1 = that.views.sendCard.line1;
                        line2 = that.views.sendCard.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2)
                    } else if(that._check_heartbeat_active()){
                        line1 = that.views.heartbeat.line1;
                        line2 = that.views.heartbeat.line2;
                        winston.info("Set line1 to " + line1);
                        winston.info("Set line2 to " + line2)
                    } else {info
                        //Standard
                        line2 = that.views.standard.line2;
                    }

                    that._setLine1(line1);
                    that._setLine2(line2);
                    that._updateLcd();
                }, 200);
            }, err => {
                deferred.reject(err);
            })

        that.io.on("connect", socket => {
            that.io.emit("lcdUpdated", { "line1": that.line1, "line2": that.line2 });
        });

        return deferred.promise;
    };

    setError(txtLine1, txtLine2) {
        this.views.error.active = true;
        this.views.error.line1 = txtLine1;
        this.views.error.line2 = txtLine2;
        this.views.error.shownAt = Date.now();
        winston.info("Error set with line1: " + txtLine1 + ", line2: " + txtLine2);
    }

    setCheckIn(name, saldo) {
        //SendCard ausblenden
        this.views.sendCard.active = false;
        this.views.check_in.active = true;
        this.views.check_in.line1 = name;
        this.views.check_in.line2 = "Saldo: " + saldo;
        this.views.check_in.shownAt = Date.now();
        winston.info("CheckIn set with line1: " + name + ", line2: " + saldo);
    }

    setSplash() {
        this.views.splash.shownAt = Date.now();
        winston.info("Splash set with line1: " + that.views.splash.line1 + ", line2: " + that.views.splash.line2);
    }

    setInverted() {
        this.views.inv_mode.active = true;
        this.views.inv_mode.shownAt = Date.now();
        winston.info("Inverted mode set active!");
    }

    setSendCard() {
        this.views.sendCard.active = true;
        this.views.sendCard.shownAt = Date.now();
        winston.info("SendCard set active!");
    }

    setHeartbeat(stat, data){
        if(stat == "ok"){
            //Fehler ausblenden
            this.views.heartbeat.shownAt = null;
            this.views.heartbeat.active = false;
            winston.info("Heartbeat inactive");
        } else {
            //Fehler anzeigen
            this.views.heartbeat.line1 = "Err server conn"
            this.views.heartbeat.line2 = data;
            // if(data == "timeout"){
            //     this.views.heartbeat.line2 = "Timeout";
            // } else {
            //     this.views.heartbeat.line2 = data.errno;
            // }
            this.views.heartbeat.active = true;
            this.views.heartbeat.shownAt = Date.now();
            winston.info("Heartbeat error active");
        }
    }

    getMode() {
        return this._check_inverted();
    }

    _setLine1(line) {
        if (line != this.line1) {
            this.line1 = line.substring(0, 16);
            this.dirty = true;
        }
    }

    _setLine2(line) {
        if (line != this.line2) {
            this.line2 = line.substring(0, 16);
            this.dirty = true;
        }
    }

    _updateLcd() {
        var that = this;
        var deferred = q.defer();

        if (!this.dirty) {
            deferred.resolve();
            return deferred.promise;
        }

        winston.info("Lcd update required!");
        this._clearDisplay().then(() => {
            var d = q.defer();
            that.lcd.setCursor(0, 0);
            that.lcd.print(that.line1);
            that.lcd.once("printed", () => { d.resolve(); });
            return d.promise;
        }).then(() => {
            var d = q.defer();
            that.lcd.setCursor(0, 1);
            that.lcd.print(that.line2);
            that.lcd.once("printed", () => { d.resolve(); });
        }).then(() => {
            that.dirty = false;
            that.emit("lcdUpdated", { "line1": that.line1, "line2": that.line2 });
            that.io.emit("lcdUpdated", { "line1": that.line1, "line2": that.line2 });
            winston.info("Lcd updated! line1: " +  that.line1 + ", line2: " + that.line2);
            deferred.resolve();
        });
        return deferred.promise;
    }

    _check_error() {
        if (this.views.error.active) {
            if(this.views.error.timeToShowMs == 0) return true; //Wenn 0 ms dann manuell ausschalten
            if (!this._check_active(this.views.error.shownAt, this.views.error.timeToShowMs)) {
                //Splash soll nicht mehr angezeigt werden
                this.views.error.active = false;
                this.views.error.shownAt = null;
                winston.info("Error will be removed!");
                return false;
            } else {
                //Splash anzeugen
                return true;
            }
        } else {
            return false;
        }
    }

    _check_checkin() {
        if (this.views.check_in.active) {
            if (!this._check_active(this.views.check_in.shownAt, this.views.check_in.timeToShowMs)) {
                //Splash soll nicht mehr angezeigt werden
                this.views.check_in.active = false;
                this.views.check_in.shownAt = null;
                winston.info("CheckIn will be removed!");
                return false;
            } else {
                //Splash anzeugen
                return true;
            }
        } else {
            return false;
        }
    }

    _check_splash() {
        if (this.views.splash.active) {
            if (!that._check_active(this.views.splash.shownAt, this.views.splash.timeToShowMs)) {
                //Splash soll nicht mehr angezeigt werden
                this.views.splash.active = false;
                this.views.splash.shownAt = null;
                winston.info("Splash will be removed!");
                return false;
            } else {
                //Splash anzeugen
                return true;
            }
        } else {
            return false;
        }
    }

    _check_inverted() {
        var ret = false;
        //Beim Inverted gibt es zwei Möglichkeiten
        // -> Zwischen 0 und 10 Uhr soll die Anzeige im Standard immer inverted sein
        // -> Wenn das Active-Flag gesetz wurde -> durch drücken des Buttons

        var currDate = new Date();
        var hours = currDate.getHours();
        if (hours > 10) {
            ret = false;
        } else {
            ret = true;
        }

        if (this.views.inv_mode.active) {
            //Der Modus soll invertiert werden
            if (!this._check_active(this.views.inv_mode.shownAt, this.views.inv_mode.timeToShowMs)) {
                //Modus soll nicht mehr invertiert werden
                this.views.inv_mode.active = false;
                this.views.inv_mode.shownAt = null;
                winston.info("Inverted mode will be removed!");
            } else {
                //Modus invertieren
                ret = !ret;
            }
        }

        return ret;
    }

    _check_sendCard_active() {
       return this.views.check_in.active;
    }

    _check_heartbeat_active() {
        return this.views.heartbeat.active
    }

    _check_active(shownAt, tts) {
        //Prüfen ob es immer noch gezeigt werden soll:
        var checkDate = new Date(shownAt);
        checkDate.setMilliseconds(checkDate.getMilliseconds() + tts);
        if (Date.now() > checkDate) {
            return false;
        } else {
            return true;
        }
    };

    _getTimeLine() {
        var now = new Date();
        return dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM");
    }

    _initLcd() {
        var that = this;
        var deferred = q.defer();

        winston.info("Initializing lcd...");
        this.cols = 16,
            this.rows = 2;
        this.lcd = new lcdMod({
            rs: 4,
            e: 17,
            data: [18, 22, 23, 24],
            cols: this.cols,
            rows: this.rows
        });

        this.lcd.on("ready", function () {
            that.lcd.clear(function (err) {
                that.lcd.setCursor(0, 0);
                winston.info("Lcd initialized!");
                deferred.resolve(that);
            }, function (err) {
                deferred.reject(err);
            });
        });

        return deferred.promise;
    };

    _loadConfig() {
        var that = this;
        var deferred = q.defer();

        winston.info("Loading config...");

        var splashLine1 = this.conf.getLcdSplashLine1();

        var splashLine2 = splashLine1.then(() => {
            return this.conf.getLcdSplashLine2();
        });
        var splashTime = splashLine2.then(() => {
            return this.conf.getLcdSplashShowTime();
        });
        var switchTime = splashTime.then(() => {
            return this.conf.getLcdSwitchTimeout()
        });
        var checkTime = switchTime.then(() => {
            return this.conf.getLcdCheckInTimeout();
        });
        var goText = checkTime.then(() => {
            return this.conf.getLcdGoText();
        });
        var comeText = goText.then(() => {
            return this.conf.getLcdComeText();
        });

        return comeText.then(() => {
            that.views.splash.line1 = splashLine1.valueOf();
            that.views.splash.line2 = splashLine2.valueOf();
            that.views.splash.timeToShowMs = parseInt(splashTime.valueOf());
            that.views.inv_mode.timeToShowMs = parseInt(switchTime.valueOf());
            that.views.check_in.timeToShowMs = parseInt(checkTime.valueOf());
            that.views.standard.line2 = goText.valueOf();
            that.views.inv_mode.line2 = comeText.valueOf();
            deferred.resolve();
        });

        return deferred.promise;
    };

    _buildViews() {
        var that = this;
        var views = {};
        views.standard = {};
        views.standard.active = false;
        views.standard.line1 = "";
        views.standard.line2 = "";
        views.standard.shownAt = null;
        views.standard.timeToShowMs = 0;
        views.inv_mode = {};
        views.inv_mode.active = false;
        views.inv_mode.line1 = "";
        views.inv_mode.line2 = "";
        views.inv_mode.shownAt = null;
        views.inv_mode.timeToShowMs = 0;
        views.check_in = {};
        views.check_in.active = false;
        views.check_in.line1 = "";
        views.check_in.line2 = "";
        views.check_in.shownAt = null;
        views.check_in.timeToShowMs = 0;
        views.splash = {};
        views.splash.active = false;
        views.splash.line1 = "";
        views.splash.line2 = "";
        views.splash.shownAt = null;
        views.splash.timeToShowMs = 0;
        views.error = {};
        views.error.active = false;
        views.error.line1 = "";
        views.error.line2 = "";
        views.error.shownAt = null;
        views.error.timeToShowMs = that.errorMs;
        views.sendCard = {};
        views.sendCard.active = false;
        views.sendCard.line1 = "Checkin is sent";
        views.sendCard.line2 = "to server...";
        views.sendCard.shownAt = null;
        views.sendCard.timeToShowMs = 0;
        views.heartbeat = {};
        views.heartbeat.active = false;
        views.heartbeat.line1 = "";
        views.heartbeat.line2 = "";
        views.heartbeat.shownAt = null;
        views.heartbeat.timeToShowMs = 0;
        this.views = views;
    };

    _clearDisplay() {
        var deferred = q.defer();

        winston.debug("Clear display!")
        this.lcd.clear(function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve();
        })

        return deferred.promise;
    }

    _close() {
        this.lcd.close();
    }
}

module.exports = Ui;
