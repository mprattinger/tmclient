angular.module("tmclient.home").controller("homeController", ["$scope", "socketService", function($scope, socketService){
    $scope.message = "Hello World";
    $scope.ui = {};
    $scope.card = {};
    $scope.logs = [];

    // socketService.on("cardDetected", function(data){
    //     console.log("Card detected! " + data);
    // })

    socketService.on("lcdUpdated", function(uiData){
        $scope.ui = uiData;
    });

    $scope.changeStatus = function(){

    }
    $scope.simCard = function(){
        
    }

}]);