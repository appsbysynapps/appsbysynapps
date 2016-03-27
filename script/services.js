angular.module('teletutor.services', ['firebase'])
.factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    return auth;
})
.factory('Users', function(FirebaseUrl, Auth, Sessions, $firebaseObject, $firebaseArray){
    var ref = new Firebase(FirebaseUrl+"/users");
    var userRef = ref.child(Auth.$getAuth().uid);
    var requestingUid = 0;
    
    return{
        "profile": function(){
            return $firebaseObject(userRef);
        },
        "all": function(){
            return $firebaseArray(ref);
        },
        "getDisplayName": function(uid){
            return $firebaseObject(ref.child(uid).child(displayName));
        },
        "makeRequest": function(otheruid){
            requestingUid = otheruid;
            requestingRef = userRef.child("requesting");
            requestingRef.set(otheruid);
            requestingRef.onDisconnect().remove();
            requestedByref = ref.child(otheruid).child("requestedBy");
            requestedByref.set(Auth.$getAuth().uid);
            requestedByref.onDisconnect().remove();
        },
        "triggerSession": function(otheruid){
            sessionId = Sessions.newSession(otheruid, Auth.$getAuth().uid);
            userRef.child("session").set(sessionId);
            ref.child(otheruid).child("session").set(sessionId);
            return sessionId;
        },
        "getSessionId": function(){
            return $firebaseObject(userRef.child("session")).$value;
        },
        //REMOVE REQUESTS ON LOG OUT
        "removeRequest": function(uid){
            userRef.child("session").remove();
            userRef.child("requesting").remove();
            ref.child(requestingUid).child("session").remove();
            ref.child(requestingUid).child("requestedBy").remove();
            requestingUid = 0;
        }
    };
})
.factory('Sessions', function(FirebaseUrl, Auth, $firebaseArray){
     var sessionRef = new Firebase(FirebaseUrl+"/sessions");
     return{
         "newSession": function(uid1, uid2){
             var newSession = sessionRef.push();
             newSession.child("users").push().set({'id':uid1});
             newSession.child("users").push().set({'id':uid2});
             return newSession.key();
         }
     }
})
.constant('FirebaseUrl', 'https://teletutor.firebaseio.com/');