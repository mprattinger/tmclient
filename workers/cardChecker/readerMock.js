var fs = require("fs");
var path = require("path");

// module.exports.findCard = function(){
//     var fname = path.join(__dirname, "mock.json");
//     var res = {};

//     if(!fs.existsSync(fname)){
//         return res
//     }
//     var data = JSON.parse(fs.readFileSync(fname, "utf8"));
//     if(data.card == true){
//         res.status = true;
//     }
//     return res;
// }

// module.exports.getUid = function(){
//     var ret = {};
//     ret.status = "ok";
//     ret.data = [ 50, 76, 174, 197, 21 ];
//     return ret;
// }

//C:\dev\js\rfidTMC\workers\cardChecker\mock.json