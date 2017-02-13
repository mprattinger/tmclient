"use strict";

const events = require("events");
const os = require("os");
const q = require("q");

class Checker extends events.EventEmitter {

	constructor() {
		super();
	}

	init() {
		this.continueChecking = false;
		if (os.platform == "linux") {
			var mfrc522 = require("mfrc522-rpi");
			this.reader = new mfrc522;
		}
		else {
			var mfrc522 = require("./mfrc522-mock");
			this.reader = new mfrc522;
		}
		this.lastCard = new Date();
	}

	checkCard() {
		var that = this;
		this.continueChecking = true;

		console.log("Waiting for cards...");
		while (that.continueChecking) {
			var resp = that.reader.findCard();
			if (!resp.status) continue;

			resp = null;
			resp = that.reader.getUid();
			if (!resp.status) continue;

			//Card is present. Checking if debounce....
			var diff = (new Date().getTime() - that.lastCard.getTime()) / 1000;
			diff = Math.round(diff);
			if (diff == 0) continue;

			that.lastCard = new Date();
			var uid = resp.data;
			var uidStr = uid[0].toString(16) + "-" + uid[1].toString(16) + "-" + uid[2].toString(16) + "-" + uid[3].toString(16);
			that.emit("cardDetected", uidStr + "@" + diff);
		}
		console.log("Cardchecking finished!");
	}

	stopReading() {
		this.continueChecking = false;
	}
}

module.exports = Checker;
