angular.module("tmclient.home").controller("homeController", ["$scope", "$http", "socketService", function ($scope, $http, socketService) {
    $scope.message = "Hello World";
    $scope.ui = {};
    $scope.card = {};
    $scope.system = {};
    $scope.logs = [];

    socketService.on("cardDetected", function (data) {
        var items = data.split("-");
        $scope.card.first = items[0].trim();
        $scope.card.second = items[1].trim();
        $scope.card.third = items[2].trim();
        $scope.card.fourth = items[3].trim();
    })

    socketService.on("lcdUpdated", function (uiData) {
        $scope.ui = uiData;
    });

    socketService.emit("getSystemInfo");
    socketService.on("systemInfo", function (data) {
        $scope.system.os = data.os;
        $scope.system.host = data.host;
        $scope.system.ip = data.ips[0];
    });

    socketService.on("newlogentry", function (data) {
        //data -> level, message
        $scope.logs.unshift(data);
    });

    $scope.changeStatus = function () {
        $http.post("/api/changeStatus").then(function (res) {
            console.log("Status changed!");
        }, function (err) {
            console.log(err);
        });
    }

    $scope.simCard = function () {
        var card = $scope.card.first + "-" + $scope.card.second + "-" + $scope.card.third + "-" + $scope.card.fourth;
        var d = {};
        d.card = card;
        $http.post("/api/simulateCard", d).then(function (res) {
            console.log("Card simulated!");
        }, function (err) {
            console.log(err);
        });
    }

    $scope.beep = function() {
        $http.post("/api/beep").then(function(res) {
            console.log("Beeped!");
        }, function(err) {
            console.log(err);
        });
    }

}]);