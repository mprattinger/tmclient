angular.module("tmclient.missingcards").controller("missingCardController", ["$scope", "$http", "$state", "$stateParams", "$uibModal", function ($scope, $http, $state, $stateParams, $uibModal) {
    $scope.card = {};
    $scope.employees = [];
    $scope.currentEmployeeId = null;

    $scope.employeeChanged = function () {

    }

    $scope.storeCardId = function () {
        var yesno = $uibModal.open({
            templateUrl: "/js/services/yesno/yesno.html",
            controller: "yesnoController",
            resolve: {
                popupData: function () {
                    return {
                        "title": "Mitarbeiter hat bereits einen Chip!",
                        "message": "Dieser Mitarbeiter hat bereits einen Chip zugeordnet. Der Chip wird überschrieben und der Mitarbeiter kann sich mit dem alten nicht mehr registrieren!! Durchführen?"
                    };
                }
            }
        });

        yesno.result.then(function () {
            //Es wurde "Ja" gedrückt
        }, function (err) {
            if (err === "cancel") {
                //Nix machen
            }
        });
        // var currentEmp = null;
        // $scope.employees.forEach(function (emp) {
        //     if (emp.id == $scope.currentEmployeeId) {
        //         currentEmp = emp;
        //     }
        //     if (emp == null) return;
        // }, this);

        // var modalInstance = $uibModal.open({
        //     templateUrl: "/js/modules/missingcards/empwithcardid.html",
        //     controller: "empwithcardidController",
        //     resolve: {
        //         popupRes: function (data) {
        //             console.log(data);
        //         }
        //     }
        // });
    };

    function loadMissingCard() {
        var id = $stateParams.id;
        $scope.card.id = id;

        $http.get("/api/getMissingCard/" + id).then(function (data) {
            if (data) {
                $scope.card = data.data;
            }
        }, function (err) {
            console.error(err);
        });

    }

    function loadEmployees() {
        $http.get("/api/loadEmployees").then(function (data) {
            if (data) {
                data.data.forEach(function (empRaw) {
                    var emp = {};
                    emp.id = empRaw.employee.employeeID;
                    emp.firstName = empRaw.employee.firstName;
                    emp.lastName = empRaw.employee.lastName;
                    emp.fullName = emp.firstName + " " + emp.lastName;
                    if (empRaw.tags && empRaw.tags.length > 0) {
                        emp.hasTag = true;
                        emp.fullName += "*";
                    }
                    else {
                        emp.hasTag = false;
                    }
                    $scope.employees.push(emp);
                }, this);
            }
        }, function (err) {
            console.error(err);
        });
    }

    loadMissingCard();
    loadEmployees();
}]);


// [
//   {
//     "id": 1,
//     "employee": {
//       "employeeId": 1,
//       "firstName": "Karin",
//       "lastName": "Seidl",
//       "workingHoursWeek": 38.5,
//       "workingDaysWeek": 5,
//       "pauseMinPerDay": 45,
//       "vacationDays": 25,
//       "firstDayOfWork": "2017-01-01T00:00:00",
//       "times": null
//     },
//     "tagId": "123-456-789-101-112"
//   }
// ]