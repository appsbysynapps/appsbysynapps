//todo: find better way of marking item as done

angular.module('teletutor.controllers', [])
    .controller('HomeCtrl', function (Users, Auth, $state, $scope) {
        var homeCtrl = this;

        $scope.logout = function () {
            Auth.$unauth();
            $state.go('login');
        };


    })
    .controller('BoardCtrl', function (Users, Auth, $state, $scope) {
        

    })
    .controller('AuthCtrl', function (FirebaseUrl, $state, $scope) {
        var authCtrl = this;
        var ref = new Firebase(FirebaseUrl);

        authCtrl.newUser = function () {
            ref.createUser({
                email: $scope.email,
                password: $scope.password
            }, function (error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                } else {
                    console.log("Successfully created user account with uid:", userData.uid);
                }
            });
        };

        authCtrl.loginEmail = function () {
            ref.authWithPassword({
                email: $scope.email,
                password: $scope.password
            }, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                }
            });
        };

    });