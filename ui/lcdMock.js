"use strict";

var events = require("events");

class LcdMock extends events.EventEmitter{
    
    constructor(object){
        super();
        var that = this;
        setTimeout(function() {
            that.emit("ready");
        }, 1000);
    }

    clear(){

    }

    setCursor(col, row){

    }

    print(text){
        var that = this;
        setTimeout(function() {
            that.emit("printed");
        }, 100);
    }

    close(){
        
    }
}

module.exports = LcdMock;