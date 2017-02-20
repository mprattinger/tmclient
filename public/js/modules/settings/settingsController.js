angular.module("tmclient.settings").controller("settingsController", ["$scope", "$http", function ($scope, $http) {

    $scope.tmserver = {};
    $scope.lcd = {};

    function loadSettings(){
        $http.get("/api/loadAllSettings").then(function(data)
        {
            $scope.tmserver = data.tmserver;
            $scope.lcd = data.lcd;
        }, function(err){
            console.log(err);
        });
    }
    loadSettings();
}]);