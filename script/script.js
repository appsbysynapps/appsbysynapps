// todo: get rid of jquery/bootstrap js on the radio buttons lol

var app = angular.module("teletutor", ["firebase", "ui.router", "puElasticInput", "teletutor.controllers", "teletutor.services"]);
app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/home',
                //abstract: true,
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl as homeCtrl',
                resolve: {
                    requireNoAuth: function ($state, Auth) {
                        return Auth.$requireAuth().then(function (auth) {

                        }, function (error) {
                            return $state.go('login');
                        });
                    }
                }
            })
            .state('board', {
                url: '/board',
                //abstract: true,
                templateUrl: 'views/board.html',
                params: {'sessionId': null},
                controller: 'BoardCtrl as boardCtrl',
                resolve: {
                    requireNoAuth: function ($state, Auth) {
                        return Auth.$requireAuth().then(function (auth) {

                        }, function (error) {
                            return $state.go('login');
                        });
                    }
                }
            })
            .state('login', {
                url: '/',
                templateUrl: 'views/login.html',
                controller: 'AuthCtrl as authCtrl',
                resolve: {
                    requireNoAuth: function ($state, Auth) {
                        return Auth.$requireAuth().then(function (auth) {
                            $state.go('home');
                        }, function (error) {
                            return;
                        });
                    }
                }
            });

    })
    .directive('whiteboard', function () {
        return {
            restrict: 'A',
            link: function (scope, el, atts) {
                
            }
        }
    });