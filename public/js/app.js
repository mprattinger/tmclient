var app = angular.module("tmclient", ["ui.router", "ui.bootstrap", "tmclient.home", "tmclient.services", "tmclient.missingcards"]);

app.config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider.state("home", {
        url: "/",
        name: "home",
        templateUrl: "js/modules/home/homeView.html",
        controller: "homeController"
    });
    $stateProvider
    .state("missingcards", {
        url: "/missingc",
        name: "missingcards",
        templateUrl: "js/modules/missingcards/missingCardsView.html",
        controller: "missingCardsController"
    })
    .state("missingcards.detail", {
        url:"/missingc/:id",
        views: {
            '@': {
                templateUrl: "js/modules/missingcards/missingCardView.html",
                controller: "missingCardController"
            }
        }
    });
}]);