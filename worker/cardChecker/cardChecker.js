var checkerModule = require("./checker");
var checker = new checkerModule();
checker.init();
checker.on("cardDetected", function(data){
    sendMessage("cardDetected", data);
});

process.on("message", function (data, cb) {
    var payload = JSON.parse(data);
    switch (payload.task) {
        case "run":
            checker.checkCard();
            break;
        case "stop":
            checker.stopReading();
            break;
    }
});

function sendMessage(type, data){
    var msg = {};
    msg.type = type;
    msg.payload = data;
    var payl = JSON.stringify(msg);
    process.send(payl);
}