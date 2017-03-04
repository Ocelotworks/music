/*
 * Copyright Ocelotworks 2016
 */

app.controller("EditSongController", function($scope, $rootScope, $http){

    $scope.albumSuggestions = [];
    $scope.artistSuggestions = [];

    $scope.error = "";

    $scope.song = {
        album: $("#newAlbumName").val(),
        artist: $("#newArtistName").val(),
        title: $("#newSongName").val(),
    };

    $scope.updateAndUnfocus = function(thing, value){
        $scope.song[thing] = value;
        $scope.albumSuggestions = [];
        $scope.artistSuggestions = [];
    };

    $scope.swap = function(){
        var artist = $scope.song.artist;
        $scope.song.artist = $scope.song.title;
        $scope.song.title = artist;
    };

    $scope.displayArtistSuggestions = debounce(function(){
        if($scope.song.album) {
            $http.get(base + "search/artist/" + $scope.song.artist).then(function (response) {
                if (response.data){
                    $scope.artistSuggestions = response.data;
                }
            });
        }
    }, 150);


    $scope.displayAlbumSuggestions = debounce(function(){
        if($scope.song.album) {
            $http.get(base + "search/album/" + $scope.song.album).then(function (response) {
                if (response.data){
                    $scope.albumSuggestions = response.data;
                }
            });
        }
    }, 150);

    $scope.editSong = function(){
      $http.post(base+"api/song/"+$("#songInfoContainer").data("id")+"/update", $scope.song).then(function(response){
         if(response.status == 200){
            $scope.error = "Saved. Changes may not appear until the page is refreshed."
         }else{
             $scope.error = response.data && response.data.err ? response.data.err : "HTTP Error "+response.status;
         }
      });
    };
});