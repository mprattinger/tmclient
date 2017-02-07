"use strict";

const events = require("events");
const mfrc522 = require("mfrc522-rpi");
const q = require("q");

class Checker extends events.EventEmitter {

	constructor(){
		super();
	}
	
	init(){
		this.continueChecking = false;
		this.reader = new mfrc522;
		this.lastCard = new Date();
	}

	checkCard(){
		var that = this;
		this.continueChecking = true;
		
		setTimeout(function(){
			console.log("Waiting for cards...");
			while(that.continueChecking){
				var resp = that.reader.findCard();
				if(!resp.status) continue;
		
				resp = null;
				resp = that.reader.getUid();
				if(!resp.status) continue;
				
				//Card is present. Checking if debounce....
				var diff = (new Date().getTime() - that.lastCard.getTime()) / 1000;
				diff = Math.round(diff);
				if(diff == 0) continue;

				that.lastCard = new Date();			
				var uid = resp.data;
                		var uidStr = uid[0].toString(16) + "-" + uid[1].toString(16) + "-" + uid[2].toString(16) + "-" + uid[3].toString(16);
                		that.emit("cardDetected", uidStr + " - " + diff);
			}
			console.log("Cardchecking finished!");
		}, 500);

		/*q.fcall(function(){
			while(that.continueChecking){
				var resp = reader.findCard();
				if(!resp.status) continue;
				
				resp = null;
				resp = reader.getUid();
				if(!resp.status) continue;
			
				var uid = resp.data;
				var uidStr = uid[0].toString(16) + "-" + uid[1].toString(16) + "-" + uid[2].toString(16) + "-" + uid[3].toString(16);
				that.emit("cardDetected", uidStr);
			}
		}); */
	}

	stopReading(){
		this.continueChecking = false;	
	}
}

module.exports = Checker;
