angular.module("tmclient.missingcards").controller("missingCardController", ["$scope", "$http", "$state", "$stateParams", function ($scope, $http, $state, $stateParams) {
    $scope.card = {};

    function loadMissingCard() {
        var id = $stateParams.id;
        $scope.card.id = id;

        $http.get("/api/getMissingCard?id=" + id).then(function (data) {
            if(data){
                $scope.card = data.data;
            }
        }, function (err) {
            console.error(err);
        });

    }
    loadMissingCard();
}]);