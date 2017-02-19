var nconf = require("nconf");
var path = require("path");

class ConfigService {

    constructor(){

        this.configFile = path.join(global.rootDir, "config.json");

        nconf
            .env()
            .argv()
            .file(this.configFile);
    }

}

module.exports = ConfigService;