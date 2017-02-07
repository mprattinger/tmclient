"use strict";

var lcdMod = require("lcd");
var lcd = new lcdMod({
	rs: 4,
	e: 17,
	data: [18, 22, 23, 24],
	cols: 16,
	rows: 2
});

lcd.on("ready", function(){
	lcd.setCursor(0,0);
	lcd.print("Hello World! What a day");
});

process.on("SIGINT", function(){
	lcd.clear();
	lcd.close();
	process.exit();
});

