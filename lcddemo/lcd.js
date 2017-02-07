"use strict";

const lcdMod = require("lcd");
const q = require("q");

class Lcd {

	constructor() {
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
			console.log("LCD ready!");
			that.lcd.clear();
			that.lcd.setCursor(0,0);
			deferred.resolve(that);
		});

		return deferred.promise;
	}

	updateLcd(){
		var that = this;
		var deferred = q.defer();

		if(!this.dirty){
			deferred.resolve();
			return deferred.promise;
		}

		this.clearDisplay();
		q.fcall(function(){
				var d = q.defer();
				that.lcd.setCursor(0,0);
				that.lcd.print(that.line1);
				that.lcd.once("printed", function(){ d.resolve(); });
				return d.promise;
			})
			.then(function(){
				var d = q.defer();
				that.lcd.setCursor(0,1);
				that.lcd.print(that.line2);
				that.lcd.once("printed", function(){ d.resolve(); });
			})
			.then(function(){
				that.dirty = false;
				deferred.resolve();
			}).done();
		return deferred.promise;
	}

	setLine1(text){
		if(this.line1 != text){
			this.line1 = text;
			this.dirty = true;
			console.log("Update line1 required");
		}
	}
	setLine2(text){
		if(this.line2 != text){
			this.line2 = text;
			this.dirty = true;
			console.log("Update line2 required");
		}
	}

	clearDisplay() {
		this.lcd.clear();

	}

	close() {
		this.lcd.clear();
		this.lcd.close();
	}
}

module.exports = Lcd;