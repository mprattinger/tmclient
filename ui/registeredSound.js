"use strict";

const onoff = require("onoff").Gpio;
const winston = require("winston");

class Sound {

    constructor() {
        this.buzzer = new onoff(5, "out");
    }

    playSound(){
        var that = this;
        that.buzzer.write(1, (err, val)=>{
            if(err){
                winston.error("Error writing 1 to bztter", err);
                return;
            }
            winston.info("Buzzer is playing the sound");
            setTimeout(()=>{
                that.buzzer.write(0, (err, val)=>{
                    if(err){
                        winston.error("Error writing 0 to bztter", err);
                        return;
                    }
                    winston.info("Buzzer sound endet");
                });
            }, 1000);
        });
    }
}

module.exports = Sound;