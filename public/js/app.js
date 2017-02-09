var app = angular.module("tmclient", ["ui.router", "tmclient.home", "tmclient.services", "tmclient.nav", "tmclient.alert"]);

app.config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider.state("home", {
        url: "/",
        templateUrl: "js/modules/home/homeView.html",
        controller: "homeController"
    });
}]);