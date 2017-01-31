var os = require("os");

if(os.platform() == "linux"){
    var reader = require("mfrc522-rpi");
} else {
    var reader = require("./readerMock");
}

module.exports.read = function(){
    var resp = reader.findCard();
    if(!resp.status){
        //No Card
        return;
    }

    res = reader.getUid();
    if(!resp.status){
        console.log("Error reading card!");
        return;
    }

    var uid = res.data;
    var uidStr = uid[0].toString(16) + "-" + uid[1].toString(16) + "-" + uid[2].toString(16) + "-" + uid[3].toString(16);
    console.log("Card detected! Uid: " + uidStr);
    
    return uidStr;
}