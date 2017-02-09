var reader = require("./reader");

var checkCards = false;

process.on("message", function (data, cb) {
    // winston.log("info", "cardChecker received msg: " + data);
    // sendMessage("info", "cardChecker received msg: " + data);
    console.log("test");
    var payload = JSON.parse(data);
    switch (payload.task) {
        case "run":
            checkCards = true;
            doJob();
            break;
        case "stop":
            stop();
            break;
    }
});

function doJob() {
    // var startDate = new Date();
    while (checkCards) {
        // var currDate = new Date();
        // var diff = (currDate - startDate) / 1000;
        // if (diff > 5) {
        //     var d = {
        //         "status": "cardDetected",
        //         "cardId": "123456"
        //     };
        //     var data = JSON.stringify(d);
        //     process.send(data);
        //     var startDate = new Date();
        // }
        var uid = reader.read();
        if(uid != null){
            var d = {
                "status": "cardDetected",
                "cardId": uid
            };
            var data = JSON.stringify(d);
            process.send(data);
        }
    }
}

function stop() {
    checkCards = false;
     console.log("stopping...");
    sendMessage("jobStopped", null);
    // var data = JSON.stringify(d);
    // process.send(data);
}

function sendMessage(type, msg){
    var msg = {};
    msg.type = type;
    msg.payload = msg;
    var payl = JSON.stringify(msg);
    process.send(payl);
}