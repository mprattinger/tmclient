angular.module("tmclient.services").controller("yesnoController", ["$scope", "$uibModalInstance", "popupData", function ($scope, $uibModalInstance, popupData){
    $scope.title = popupData.title;
    $scope.message = popupData.message;

    $scope.yes = function () {
        $uibModalInstance.close();
    };
    $scope.no = function () {
        $uibModalInstance.dismiss("cancel");
    };
}]);