"use strict";

const events = require("events");
const onoff = require("onoff");

class Button extends events.EventEmitter {

    constructor() {
        super();
        this.btn = new onoff(27, "in", "falling", { debounceTimeout: 300 });
    }

    init() {
        var that = this;
        this.btn.watch(function (err, val) {
            if (val == 1) {
                that.emit("statusButtonPressed");
            }
        });
    }
}

module.exports = Button;