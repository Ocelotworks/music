/*
 * Copyright Ocelotworks 2016
 */

app.controller('AddToPlaylistController', function($scope, $http, $rootScope){

    $scope.selectedPlaylist = null;

    $scope.selectPlaylist = function(id){
        $scope.selectedPlaylist = id;
        console.log("Selected playlist is now "+$scope.selectedPlaylist);
    };

    $scope.addSongToPlaylist = function(id){
        console.log("Btuton pressed");
        if(id === ""){ //You call this jenky? I call it P R O G R E S S
            console.log("Sending result through event instead");
            $rootScope.$emit("selectPlaylist", $scope.selectedPlaylist, $(".songSelect:checked~.songSelectName").text());
            $scope.$emit("closeModal");
        }else{
            if($scope.selectedPlaylist){
                $http.post(base+"templates/add/playlist/"+$scope.selectedPlaylist+"/addSong/"+id);
                $scope.$emit("closeModal");
            }else{
                console.log("selectedPlaylist is "+$scope.selectedPlaylist);
            }
        }

    };
});