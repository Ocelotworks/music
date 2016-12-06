/*
 * Copyright Ocelotworks 2016
 */

app.controller("EditSongController", function($scope, $rootScope, $http){

    $scope.albumSuggestions = [];
    $scope.artistSuggestions = [];



    $scope.song = {
        album: $("#newAlbumName").val(),
        artist: $("#newArtistName").val(),
        title: $("#newSongName").val(),
    };

    $scope.editSong = function(){

    };

    $scope.updateAndUnfocus = function(thing, value){
        $scope.song[thing] = value;
        $scope.albumSuggestions = [];
        $scope.artistSuggestions = [];
    };


    $scope.displayAlbumSuggestions = debounce(function(){
        if($scope.song.album) {
            $http.get(base + "search/album/" + $scope.song.album).then(function (response) {
                if (response.data){
                    $scope.albumSuggestions = response.data;
                }
            });
        }
    }, 150);
});