// todo: get rid of jquery/bootstrap js on the radio buttons lol

var app = angular.module("teletutor", ["firebase", "ui.router", "puElasticInput", "teletutor.controllers", "teletutor.services"]);

app.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}]);

app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/home',
                //abstract: true,
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl as homeCtrl',
                resolve: {
                    "requireAuth": ["Auth", function (Auth) {
                        return Auth.$requireSignIn();
                    }]
                }
            })
            .state('board', {
                url: '/board',
                //abstract: true,
                templateUrl: 'views/board.html',
                params: {'sessionId': null, 'otherUid': null,},
                controller: 'BoardCtrl as boardCtrl',
                resolve: {
                    "requireAuth": ["Auth", function (Auth) {
                        return Auth.$requireSignIn();
                    }]
                }
            })
            .state('login', {
                url: '/',
                templateUrl: 'views/login.html',
                controller: 'AuthCtrl as authCtrl',
            });

    })
    .directive('whiteboard', function () {
        return {
            restrict: 'A',
            link: function (scope, el, atts) {
                
            }
        }
    });