angular.module("tmclient.services").factory("socketService", ["$rootScope", function ($rootScope) {
    var factory = {};
    var socket = io();

    factory.on = function (eventName, cb) {
        socket.on(eventName, function (data) {
            $rootScope.$apply(function () {
                cb(data);
            });
        });
    };

    factory.emit = function(eventName, data, cb){
        socket.emit(eventName, data, function(resEmit){
            
        });
    }

    return factory;
}]);