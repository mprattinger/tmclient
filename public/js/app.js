var app = angular.module("tmclient", ["ui.router", "tmclient.home", "tmclient.services", "tmclient.missingcards"]);

app.config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider.state("home", {
        url: "/",
        name: "home",
        templateUrl: "js/modules/home/homeView.html",
        controller: "homeController"
    });
    $stateProvider.state("missingcards", {
        url: "/missingc",
        name: "missingcards",
        templateUrl: "js/modules/missingcards/missingCardsView.html",
        controller: "missingCardsController"
    });
}]);