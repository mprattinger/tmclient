"use strict";
var lcdMod = null;
const os = require("os");
if (os.platform() == "linux") {
	lcdMod = require("lcd");
} else {
	lcdMod = require("./lcdMock");
}
const q = require("q");
const events = require("events");

class Lcd extends events.EventEmitter {

	constructor() {
		super();
		this.line1 = "";
		this.line2 = "";
		this.dirty = false;
	}

	init() {
		var that = this;
		var deferred = q.defer();

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
				deferred.resolve(that);
			}, function (err) {
				deferred.reject(err);
			});
		});

		return deferred.promise;
	}

	updateLcd() {
		var that = this;
		var deferred = q.defer();

		if (!this.dirty) {
			deferred.resolve();
			return deferred.promise;
		}

		this.clearDisplay().then(function () {
			var d = q.defer();
			that.lcd.setCursor(0, 0);
			that.lcd.print(that.line1);
			that.lcd.once("printed", function () { d.resolve(); });
			return d.promise;
		})
			.then(function () {
				var d = q.defer();
				that.lcd.setCursor(0, 1);
				that.lcd.print(that.line2);
				that.lcd.once("printed", function () { d.resolve(); });
			})
			.then(function () {
				that.dirty = false;
				that.emit("lcdUpdated", { "line1": that.line1, "line2": that.line2 });
				deferred.resolve();
			}).done();
		return deferred.promise;
	}

	setLine1(text) {
		if (this.line1 != text) {
			this.line1 = text;
			this.dirty = true;
		}
	}
	setLine2(text) {
		if (this.line2 != text) {
			this.line2 = text;
			this.dirty = true;
		}
	}

	clearDisplay() {
		var deferred = q.defer();

		this.lcd.clear(function (err) {
			if (err) {
				deferred.reject(err);
				return;
			}
			deferred.resolve();
		})

		return deferred.promise;
	}

	close() {
		this.lcd.close();
		// this.lcd.clear().then(function () {
		// 	this.lcd.close();
		// });
	}
}

module.exports = Lcd;