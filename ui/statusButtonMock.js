"use strict";

const events = require("events");

class ButtonMock extends events.EventEmitter {

    constructor() {
        super();
    }

    init() {
        var that = this;
        setTimeout(function() {
            that.emit("statusButtonPressed");
        }, 10000);
    }
}

module.exports = ButtonMock;