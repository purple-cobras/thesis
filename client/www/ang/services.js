angular.module('app.services', [])

.factory('Sockets', [function($rootScope, store){

  socket.on('invite', function (invitedBy) {
    console.log(invitedBy);
  });

  socket.on('inviteAccepted', function (acceptedBy) {
    console.log(acceptedBy);
  });

  socket.on('inviteDeclined', function (declinedBy) {
    console.log(declinedBy);
  });

  return {};
}])

.service('BlankService', [function(){

}]);

