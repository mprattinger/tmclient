angular.module("tmclient.nav").controller("navController", ["$scope", "socketService", function($scope, socketService){

    $scope.system = {};

    socketService.emit("getSystemInfo");
    socketService.on("systemInfo", function(data){
        $scope.system.os = data.os;
        $scope.system.host = data.host;
    });

}]);