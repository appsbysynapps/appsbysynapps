angular.module('teletutor.services', ['firebase'])
.factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    return auth;
})
.factory('Users', function(FirebaseUrl, Auth){
    var ref = new Firebase(FirebaseUrl+"/users/"+Auth.$getAuth().uid);
    
    return{
        "add": function(name, type, date){
            var newTask = ref.child("tasks").push();
            newTask.set({
                "name": name,
                "type": parseInt(type),
                "date": date.getTime(),
                "done": false
            });
        }
    };
})
.factory('Tasks', function(FirebaseUrl, Auth, $firebaseArray){
     var ref = new Firebase(FirebaseUrl+"/users/"+Auth.$getAuth().uid+"/tasks");
     var tasks = $firebaseArray(ref);
     return{
         "all": function(){
             return tasks;
         },
         "incomplete": function(){
             return $firebaseArray(ref.orderByChild("done").equalTo(false));
         }
     }
})
.constant('FirebaseUrl', 'https://teletutor.firebaseio.com/');