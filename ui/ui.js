"use strict";

var events = require("events");
var q = require("q");
var dateFormat = require("dateformat");
var os = require("os");

var lcdMod = require("./lcd");

class Ui extends events.EventEmitter {

    constructor(conf) {
        super();
        var that = this;
        this.conf = conf;

        if (os.platform() == "linux") {
            var btnMod = require("./statusButton");
            that.btn = new btnMod();
        } else {
            var btnMockMod = require("./statusButtonMock");
            that.btn = new btnMockMod();
        }
        that.btn.init();

        this.lcd = new lcdMod();

        this.conf.getLcdSplashLine1().then(txt => {
            that.splashLine1 = txt;
        }, err => {
        });
        this.conf.getLcdSplashLine2().then(txt => {
            that.splashLine2 = txt;
        }, err => {
        });
        this.conf.getLcdSplashShowTime().then(time => {
            that.splashShowTime = parseInt(txt);
        }, err => {
        });
        this.conf.getLcdSwitchTimeout().then(txt => {
            that.statusSwitchTimeout = parseInt(txt);
        }, err => {
        });
        this.conf.getLcdCheckInTimeout().then(txt => {
            that.checkedInTimeout = parseInt(txt);
        }, err => {
        });
        this.conf.getLcdGoText().then(txt => {
            that.statusGo = txt;
        }, err => {
        });
        this.conf.getLcdComeText().then(txt => {
            that.statusCome = txt;
        }, err => {
        });

        this.go = this._getStandardStatus();
        this.standardMode = true;

        this.lcd.on("lcdUpdated", function (lcdData) {
            that.emit("lcdUpdated", lcdData);
        })

        that.btn.on("statusButtonPressed", function () {
            that.emit("statusButtonPressed");
            that.changeStatus();
        })
    }

    init(io) {
        var that = this;

        this.io = io;

        that.initUi().then(function () {
            return that.showSplash();
        }).then(function () {
            return that.runStandardUi();
        }).then(function () {
            that.emit("uiReady");
        });

        that.on("lcdUpdated", function (uiData) {
            that.io.emit("lcdUpdated", uiData);
        });
        that.on("statusButtonPressed", function () {
            that.io.emit("statusButtonPressed");
        })
    }

    initUi() {
        var that = this;
        var deferred = q.defer();

        this.lcd.init().then(function () {
            deferred.resolve();
        });

        return deferred.promise;
    }

    showSplash() {
        var that = this;
        var deferred = q.defer();

        that.standardMode = false;

        this.lcd.setLine1(this.splashLine1);
        this.lcd.setLine2(this.splashLine2);
        this.lcd.updateLcd().then(function () {
            that.emit("splashShown");
            setTimeout(function () {
                that.emit("removeSplash");
                deferred.resolve();
            }, that.splashShowTime);
        });

        return deferred.promise;
    }

    runStandardUi() {
        var that = this;

        that.standardMode = true;

        that.lcd.setLine1(that._getTimeLine());
        that.lcd.setLine2(that._getStatusLine());
        this.lcd.updateLcd().then(function () {
            that.intervalId = setInterval(function () {
                that.lcd.setLine1(that._getTimeLine());
                that.lcd.setLine2(that._getStatusLine());
                that.lcd.updateLcd()
            }, 1000);
        });
    }

    changeStatus() {
        var that = this;
        var deferred = q.defer();

        that.standardMode = false;

        that.go = !this.go;
        that.lcd.setLine2(that._getStatusLine());
        that.lcd.updateLcd()
        setTimeout(function () {
            that.standardMode = true;
            that.go = that._getStandardStatus();
            that.lcd.setLine2(that._getStatusLine());
            that.lcd.updateLcd().then(function () {
                deferred.resolve();
            })
        }, that.statusSwitchTimeout);

        return deferred.promise;
    }

    empCheckedIn(data) {
        var that = this;

        that.standardMode = false;
        clearInterval(this.intervalId);

        this.lcd.setLine1("TimeManager 1.0");
        this.lcd.setLine2("(c) MPrattinger");
        
        this.lcd.updateLcd().then(function () {
            setTimeout(function () {
                that.runStandardUi();
            }, that.checkedInTimeout);
        });
    }

    heartbeatFailed(){
        var that = this;

        that.standardMode = false;
        clearInterval(this.intervalId);

        this.lcd.setLine1("Server-Conn");
        this.lcd.setLine2("FAILED");
        
        this.lcd.updateLcd().then(function () {
            setTimeout(function () {
                that.runStandardUi();
            }, that.checkedInTimeout);
        });
    }

    close() {
        this.lcd.close();
    }

    _getTimeLine() {
        var now = new Date();
        return dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM");
    }

    _getStatusLine() {
        if(this.standardMode){
            this.go = this._getStandardStatus();
        }
        if (this.go) return this.statusGo;
        else return this.statusCome;
    }

    _getStandardStatus() {
        var currDate = new Date();
        var hours = currDate.getHours();
        if (hours > 10) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = Ui;