angular.module("tmclient.missingcards").controller("missingCardsController", ["$scope", "$http", function ($scope, $http) {
    $scope.missing = [];
    $scope.hello = "Hello in missing cards!";

    function loadMissingCards() {
        $http.get("/api/getMissingCards").then(function (data) {
            $scope.missing = data.data;
        }, function (err) {
            console.log(err);
        });
    }

    loadMissingCards();
}]);