angular.module('teletutor.services', ['firebase'])
    .factory('Auth', function ($firebaseAuth, FirebaseUrl) {
        var auth = $firebaseAuth();

        return auth;
    })
    .factory('Users', function (FirebaseUrl, Auth, Sessions, $firebaseObject, $firebaseArray) {
        var ref = firebase.database().ref("/users");
        var userRef = ref.child(Auth.$getAuth().uid);
        var requestingUid = 0;

        return {
            "profile": function () {
                return $firebaseObject(userRef);
            },
            "all": function () {
                return $firebaseArray(ref);
            },
            "getDisplayName": function (uid) {
                return $firebaseObject(ref.child(uid).child(displayName));
            },
            "makeRequest": function (otheruid) {
                requestingUid = otheruid;
                requestingRef = userRef.child("requesting");
                requestingRef.set(otheruid);
                requestingRef.onDisconnect().remove();
                requestedByref = ref.child(otheruid).child("requestedBy");
                requestedByref.set(Auth.$getAuth().uid);
                requestedByref.onDisconnect().remove();
            },
            "triggerSession": function (otheruid) {
                sessionId = Sessions.newSession(otheruid, Auth.$getAuth().uid);
                userRef.child("session").set(sessionId);
                ref.child(otheruid).child("session").set(sessionId);
                return sessionId;
            },
            "getSessionId": function () {
                return $firebaseObject(userRef.child("session")).$value;
            },
            //REMOVE REQUESTS ON LOG OUT
            "removeRequest": function (uid) {
                userRef.child("session").remove();
                userRef.child("requesting").remove();
                ref.child(requestingUid).child("session").remove();
                ref.child(requestingUid).child("requestedBy").remove();
                requestingUid = 0;
            }
        };
    })
    .factory('Sessions', function (FirebaseUrl, Auth, $firebaseArray) {
        var sessionRef = firebase.database().ref("/sessions");
        return {
            "newSession": function (uid1, uid2) {
                var newSession = sessionRef.push();
                newSession.child("users").push().set({
                    'id': uid1
                });
                newSession.child("users").push().set({
                    'id': uid2
                });
                return newSession.key;
            }
        }
    })
    .constant('FirebaseUrl', 'https://teletutor.firebaseio.com/')
    .directive('webrtcVideo', ['$window', 'Auth', function ($window, Auth) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, elem, attrs) {
                console.log('something happening!!');
                var phone = $window.phone = PHONE({
                    number: Auth.$getAuth().uid, // listen on username line else Anonymous
                    publish_key: 'pub-c-2544a2f9-c98a-4820-ad84-4d65dadc9e73',
                    subscribe_key: 'sub-c-97f2f192-3aec-11e6-9c7c-0619f8945a4f',
                    media: {
                        audio: true,
                        video: true
                    },
                    ssl: true,
                });

                phone.ready(function () {
                    scope.phoneNotReady = false;
                    scope.$apply();
                });

                console.log(elem);


                phone.receive(function (session) {
                    session.connected(function (session) {

                        $(elem).append(session.video);
                        $('#vid-thumb').append(phone.video);
                    });
                    session.ended(function (session) {
                        $(elem).innerHTML = '';
                        $('#vid-thumb').innerHTML = '';

                    });
                });

                scope.makeCall = function () {
                    if (!($window.phone)) alert("Login First!");
                    else $window.phone.dial(scope.dialNumber);
                }
            }
        };
    }])
    .directive('fullHeight', function ($window) {

        return {
            restrict: 'A',

            link: function (scope, elem, attrs) {

                var winHeight = $window.innerHeight;

                var headerHeight = attrs.banner ? attrs.banner : 0;

                elem.css('height', winHeight - headerHeight + 'px');
            }
        };
    });;