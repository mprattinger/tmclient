angular.module("tmclient.home").controller("homeController", ["$scope", "socketService", function($scope, socketService){
    $scope.message = "Hello World";

    socketService.on("cardDetected", function(data){
        console.log("Card detected! " + data);
    })

}]);