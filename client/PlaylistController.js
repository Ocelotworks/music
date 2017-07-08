/*
 * Copyright Ocelotworks 2016
 */

app.controller("PlaylistController", function($scope, $rootScope, $http){

    $rootScope.isEditing = false;
    $scope.isSaving = false;

    $scope.toggleEditing = function(){
        $rootScope.isEditing = !$rootScope.isEditing;
        if($rootScope.isEditing){
            $("#playlistSongList").sortable({
                handle: ".moveSong"
            });
        }else{
            //save
        }
    };

    $scope.removeSong = function(e){
        //console.log(e);
        var song = e.target.parentElement.parentElement;
        console.log(song);
        $(song).css({'margin-left': '-1000px', opacity: 0});
        setTimeout(function(){
            $(song).remove();
        }, 600);
        e.preventDefault();
        e.stopPropagation();
    };

    $scope.removedSongs = [];

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