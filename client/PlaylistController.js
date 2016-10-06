/*
 * Copyright Ocelotworks 2016
 */

app.controller("PlaylistController", function($scope, $rootScope, $http){
    $scope.deletePlaylist = function(id){
        $rootScope.$emit("openModal", "delete/playlist/"+id);
    };

    $scope.deletePlaylistForReal = function(id){
        $http.get(base+"templates/delete/playlist/"+id+"/confirmed");
        $rootScope.$emit("closeModal");
        $rootScope.$emit("switchTab", 4);

    };
});