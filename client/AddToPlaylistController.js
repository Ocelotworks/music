/*
 * Copyright Ocelotworks 2016
 */

app.controller('AddToPlaylistController', function($scope, $http){

    $scope.selectedPlaylist = null;

    $scope.selectPlaylist = function(id){
        $scope.selectedPlaylist = id;
        console.log("Selected playlist is now "+$scope.selectedPlaylist);
    };

    $scope.addSongToPlaylist = function(id){
        console.log("Btuton pressed");
        if($scope.selectedPlaylist){
            $http.post(base+"templates/add/playlist/"+$scope.selectedPlaylist+"/addSong/"+id);
            $scope.$emit("closeModal");
        }else{
            console.log("selectedPlaylist is "+$scope.selectedPlaylist);
        }
    };
});