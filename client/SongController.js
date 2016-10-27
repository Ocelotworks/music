/*
 * Copyright Ocelotworks 2016
 */

app.controller('SongController', function($scope, $rootScope, $sce, $templateRequest, $compile, $http, $location){

    $scope.playSong = function(event){
        $rootScope.playByElement(event.target);
    };


    $scope.showSongContextMenu = function(event){
        $("#songContextMenu").finish().toggle(100).css({left: event.pageX, top: event.pageY, display: "absolute"}).data("id", event.target.attributes["data-id"].value);
    };


    $scope.togglePlaying = function(){
        console.log("Toggling??");
        if($rootScope.audioPlayer.paused)
            $rootScope.audioPlayer.play();
        else
            $rootScope.audioPlayer.pause();
    };


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.showSongList = function(template){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/songs/"+template);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

    };

    $scope.playArtist = function(id){
        $scope.showSongList("artist/"+id+"#"+Math.random());
    };

    $scope.playAlbum = function(id){
        $scope.showSongList("album/"+id+"#"+Math.random());
    };

    $scope.playPlaylist = function(id){
        $location.path("/playlist/"+id);
        $scope.showSongList("playlist/"+id+"#"+Math.random());
    };

    $scope.playGenre = function(id){
        $scope.showSongList("genre/"+id+"#"+Math.random());
    };

    $scope.skipSong = function(){
        ga('send', 'event', "Song", "Skip", $rootScope.nowPlaying.id, $rootScope.nowPlaying.elapsed);
        $scope.playNext();
    };

    $scope.rateSongUp = debounce(function(){
        $http({
            method: 'PUT',
            url: 'song/'+$rootScope.nowPlaying.id+"/vote/up"
        });
        $(".songRate").removeClass("rated");
        $("#songRateUp").addClass("rated");
    }, 1000, true);

    $scope.rateSongDown = debounce(function(){
        $http({
            method: 'PUT',
            url: 'song/'+$rootScope.nowPlaying.id+"/vote/down"
        });
        $(".songRate").removeClass("rated");
        $("#songRateDown").addClass("rated");
    }, 1000, true);
});