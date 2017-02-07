"use strict";

var onoff = require("onoff");

var uiMod = require("./ui");

var ui = new uiMod();
ui.initUi().then(function(){
    return ui.showSplash();
}).then(function(){
    return ui.runStandardUi();
}).then(function(){
    console.log("UI ready...");
});

var io = onoff.Gpio;
var btn = new io(27, "in", "falling", { debounceTimeout : 300 });
btn.watch(function(err, val){
    if(val == 1){
        ui.changeStatus();
    }
});

// var dateFormat = require("dateformat");
// var onoff = require("onoff");

// var status = "Gehen";

// var lcdMod = require("./lcd"); 
// var lcd = new lcdMod();
// lcd.init().then(function (currLcd) {
//     currLcd.line1 = "TimeManager 1.0";
//     currLcd.line2 = "(c) MPrattinger";
//     currLcd.updateLcd().then(function () { console.log("Written!"); });

//     setTimeout(function () {
//         var now = new Date();
//         currLcd.setLine1(dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM"));
//         currLcd.setLine2(status);
//         currLcd.updateLcd();
//     }, 5000);

//     setInterval(function () {
//         var now = new Date();
//         currLcd.setLine1(dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM"));
//         currLcd.setLine2(status);
//         currLcd.updateLcd();
//     }, 1000)
// }, function (err) { });

// var io = onoff.Gpio;
// if(!io) console.error("Cannot initialze onoff");
// var btn = new io(27, "in", "falling", { debounceTimeout : 100 });
// if(!btn) console.error("Button not initialzed");

// let go = true;
// btn.watch(function(err, val){
//     if(val==1){
//         go = !go;
//         if(go) {
//             status = "Gehen";
//         }
//         else {
//             status = "Kommen"
//         }
//         lcd.setLine2(status);
//         lcd.updateLcd();
//     }
//     setTimeout(function() {
//         if(!go){
//             go = true;
//             status = "Gehen";
//             lcd.setLine2(status);
//             lcd.updateLcd();
//         }
//     }, 5000);
// });

process.on("SIGINT", function () {
    console.log("Closing lcd...");
    ui.close();
    process.exit();
});