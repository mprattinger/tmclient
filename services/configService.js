var nconf = require("nconf");
var path = require("path");

class ConfigService {

    constructor() {

        this.configFile = path.join(global.rootDir, "config.json");

        nconf
            .env()
            .argv()
            .file(this.configFile);
    }

    getTimeMangerServer() {
        return "localhost";
    }

    getTimeMangerServerPort() {
        return 55319;
    }

    getTimeMangerServerApi() {
        return "/api/timemanager";
    }

    getTimeMangerServerEmployeeApi() {
        return "/api/employees";
    }

}

module.exports = ConfigService;