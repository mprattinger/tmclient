angular.module("tmclient.settings").controller("settingsController", ["$scope", "$http", "$compile", function ($scope, $http, $compile) {
    $scope.forms = {};
    $scope.tmserver = {};
    $scope.lcd = {};

    function loadSettings() {
        $http.get("/api/loadAllSettings").then(function (data) {
            $scope.tmserver = data.data.server || {};
            $scope.lcd = data.data.lcd || {};

            if ($scope.tmserver.serverport) {
                $scope.tmserver.serverport = parseInt($scope.tmserver.serverport);
            }
        }, function (err) {
            console.log(err);
        });
    }
    loadSettings();

    $scope.saveServer = function () {
        $http.post("/api/saveServerSettings", $scope.tmserver).then(function (res) {
            console.log("ServerSettings saved");
            loadSettings();
            $scope.forms.serverform.$setPristine();
        }, function (err) {
            console.log(err);
        });
    };
    $scope.saveLcd = function () {
        $http.post("/api/saveLcdSettings", $scope.lcd, {}).then(function (res) {
            console.log("LCDSettings saved");
            loadSettings();
            $scope.forms.lcdform.$setPristine();
        }, function (err) {
            console.log(err);
        });
    }
}]);