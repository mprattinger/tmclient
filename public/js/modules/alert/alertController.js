angular.module("tmclient.alert").controller("alertController", ["$scope", "socketService", function($scope, socketService){

    $scope.errors = [];

    socketService.on("cardDetected", function(data){
        var msg = {};
        msg.msg = "Card Detected!: " + data;
        msg.class = "alert-success";
        $scope.errors.push(msg);
    });

}]);