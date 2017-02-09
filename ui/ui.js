"use strict";

var events = require("events");
var q = require("q");
var dateFormat = require("dateformat");
var os = require("os");

var lcdMod = require("./lcd");

class Ui extends events.EventEmitter {

    constructor() {
        super();
        var that = this;

        if(os.platform == "linux"){
            var btnMod = require("./statusButton");
            that.btn = new btnMod();
        } else {
            var btnMockMod = require("./statusButtonMock");
            that.btn = new btnMockMod();
        }
        that.btn.init();

        this.lcd = new lcdMod();
        this.splashShowTime = 5000;
        this.statusSwitchTimeout = 5000;
        this.statusGo = "Gehen";
        this.statusCome = "Kommen";
        this.go = this._getStandardStatus();

        this.lcd.on("lcdUpdated", function(lcdData){
            that.emit("lcdUpdated", lcdData);
        })

        that.btn.on("statusButtonPressed", function(){
            that.emit("statusButtonPressed");
            that.changeStatus();
        })
    }

    init() {
        var that = this;
        that.initUi().then(function () {
            return that.showSplash();
        }).then(function () {
            return that.runStandardUi();
        }).then(function () {
            that.emit("uiReady");
        });
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

        this.lcd.setLine1("TimeManager 1.0");
        this.lcd.setLine2("(c) MPrattinger");
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

        that.lcd.setLine1(that._getTimeLine());
        that.lcd.setLine2(that._getStatusLine());
        this.lcd.updateLcd().then(function () {
            setInterval(function () {
                that.lcd.setLine1(that._getTimeLine());
                that.lcd.setLine2(that._getStatusLine());
                that.lcd.updateLcd()
            }, 1000);
        });
    }

    changeStatus() {
        var that = this;
        var deferred = q.defer();

        that.go = !this.go;
        that.lcd.setLine2(that._getStatusLine());
        that.lcd.updateLcd()
        setTimeout(function () {
            that.go = that._getStandardStatus();
            that.lcd.setLine2(that._getStatusLine());
            that.lcd.updateLcd().then(function () {
                deferred.resolve();
            })
        }, that.statusSwitchTimeout);

        return deferred.promise;
    }

    close() {
        this.lcd.close();
    }

    _getTimeLine() {
        var now = new Date();
        return dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM");
    }

    _getStatusLine() {
        if (this.go) return this.statusGo;
        else return this.statusCome;
    }

    _getStandardStatus() {
        var currDate = new Date();
        if (currDate.getHours() > 10) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = Ui;