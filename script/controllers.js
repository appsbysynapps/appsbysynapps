angular.module('teletutor.controllers', [])
    .controller('HomeCtrl', function (FirebaseUrl, $firebaseObject, Users, Auth, $state, $scope) {
        var homeCtrl = this;

        Users.profile().$bindTo($scope, "user");

        $scope.users = Users.all();

        $scope.logout = function () {
            Users.removeRequest(Auth.$getAuth().uid);
            Auth.$unauth();
            $state.go('login');
        };

        $scope.request = function (uid) {
            Users.makeRequest(uid);
            var sessionRef = new Firebase(FirebaseUrl + "/users/" + Auth.$getAuth().uid + "/session");
            sessionRef.on('value', function (snapshot) {
                if (snapshot.val()) {
                    $state.go('board',{'sessionId': snapshot.val()});
                }
            });
        }
        
        $scope.cancelRequest = function(){
            Users.removeRequest(Auth.$getAuth().uid);
        }

        $scope.triggerSession = function (requesterUid) {
            var sessionId = Users.triggerSession(requesterUid);
            $state.go('board',{'sessionId': sessionId});
        }
    })
    .controller('BoardCtrl', function (FirebaseUrl, Users, Auth, $state, $scope, $stateParams) {
        //Set up some globals
        var pixSize = 1,
            lastPoint = null,
            currentColor = "000",
            mouseDown = 0;

        //Create a reference to the pixel data for our drawing.
        var sessionId = $stateParams.sessionId;
        var pixelDataRef = new Firebase(FirebaseUrl+"/sessions/"+sessionId+"/pixelData");

        // Set up our canvas
        var myCanvas = document.getElementById('drawing-canvas');;
        var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
        if (myContext == null) {
            alert("You must use a browser that supports HTML5 Canvas to run this demo.");
            return;
        }

        myContext.lineCap = "round";
        myContext.strokeStyle = "#000000";
        myContext.lineWidth = 5;

        //Setup each color palette & add it to the screen
        var colors = ["fff", "000", "f00", "0f0", "00f", "88f", "f8d", "f88", "f05", "f80", "0f8", "cf0", "08f", "408", "ff8", "8ff"];
        for (c in colors) {
            var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
            item.click((function () {
                var col = colors[c];
                return function () {
                    currentColor = col;
                };
            })());
            item.appendTo('#colorholder');
        }

        //Keep track of if the mouse is up or down
        myCanvas.onmousedown = function () {
            mouseDown = 1;
        };
        myCanvas.onmouseout = myCanvas.onmouseup = function () {
            mouseDown = 0;
            lastPoint = null;
        };

        //Draw a line from the mouse's last position to its current position
        var drawLineOnMouseMove = function (e) {
            if (!mouseDown) return;

            e.preventDefault();

            // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
            var offset = $('canvas').offset();
            var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
                y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
            var x0 = (lastPoint == null) ? x1 : lastPoint[0];
            var y0 = (lastPoint == null) ? y1 : lastPoint[1];

            pixelDataRef.child(x0 + ":" + y0).set(x1 + ":" + y1);

            /*myContext.beginPath();
            myContext.moveTo(x0, y0)
            myContext.lineTo(x1, y1);
            myContext.stroke();*/

            lastPoint = [x1, y1];
        };
        $(myCanvas).mousemove(drawLineOnMouseMove);
        $(myCanvas).mousedown(drawLineOnMouseMove);

        // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
        // Note that child_added events will be fired for initial pixel data as well.
        var drawPixel = function (snapshot) {
            var coords = snapshot.key().split(":");
            var coords2 = snapshot.val().split(":");
            myContext.beginPath();
            myContext.moveTo(coords[0], coords[1])
            myContext.lineTo(coords2[0], coords2[1]);
            myContext.stroke();
        };
        var clearPixel = function (snapshot) {
            var coords = snapshot.key().split(":");
            myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
        };
        pixelDataRef.on('child_added', drawPixel);
        pixelDataRef.on('child_changed', drawPixel);
        pixelDataRef.on('child_removed', clearPixel);
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
                    ref.child("users/" + userData.uid + "/displayName").set(userData.uid);
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
                    $state.go('home');
                }
            });
        };

    });