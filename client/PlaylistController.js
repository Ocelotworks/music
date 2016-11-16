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

    $scope.queuePlaylist = function(){
        var songs = $(".songList.playable:visible .song");

        for(var songElem in songs)
            if(songs.hasOwnProperty(songElem))
                $rootScope.addToQueue(songs[songElem]);


    };

    $scope.shufflePlaylist = function(){
        var songs = $(".songList.playable:visible .song");

        shuffle(songs);

        for(var songElem in songs)
            if(songs.hasOwnProperty(songElem))
                $rootScope.addToQueue(songs[songElem]);


    };
});