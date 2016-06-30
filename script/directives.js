angular.module('teletutor.directives', ['firebase, Auth'])
    .directive('webrtc-video', ['$scope', '$window'
        Auth,
        function ($scope, $window, Auth) {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {
                    var phone = $window.phone = PHONE({
                        number: Auth.$getAuth().uid, // listen on username line else Anonymous
                        publish_key: 'pub-c-2544a2f9-c98a-4820-ad84-4d65dadc9e73',
                        subscribe_key: 'sub-c-97f2f192-3aec-11e6-9c7c-0619f8945a4f',
                        ssl: true,
                    });

                    phone.ready(function () {
                        $scope.phoneNotReady = false;
                        console.log("I'm freaking ready!");
                    });

                    phone.receive(function (session) {
                        session.connected(function (session) {
                            $(elem).appendChild(session.video);
                        });
                        session.ended(function (session) {
                            $(elem).innerHTML = '';
                                
                        });
                    });
                },
                controller: function ($scope, $element, $window) {
                    $scope.makeCall = function () {
                        if (!($window.phone)) alert("Login First!");
                        else $window.phone.dial($scope.dialNumber);
                    }
                }
            },
    }]);