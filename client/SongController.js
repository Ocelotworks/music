/*
 * Copyright Ocelotworks 2016
 */

app.controller('SongController', function($scope, $rootScope, $sce, $templateRequest, $compile, $http, $location){

    $scope.playSong = function(event){
        $rootScope.playByElement(event.target, true);
    };


    $scope.showSongContextMenu = function(event){
        $("#songContextMenu").finish().toggle(100).css({left: event.pageX, top: event.pageY, display: "absolute"})
            .data("id", event.target.attributes["data-id"].value)
            .data("artist", event.target.attributes["data-artist"].value)
            .data("album", event.target.attributes["data-album"].value);
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

        var templateUrl = $sce.getTrustedResourceUrl("templates/songs/"+template+"#"+Math.random());
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

    };

    $scope.playArtist = function(id){
        $scope.showSongList("artist/"+id);
    };

    $scope.playAlbum = function(id){
        $scope.showSongList("album/"+id);
    };

    $scope.playPlaylist = function(id){
        $location.path("/playlist/"+id);
        $scope.showSongList("playlist/"+id);
    };

    $scope.playGenre = function(id){
        $scope.showSongList("genre/"+id);
    };

    $scope.skipSong = function(){
        if($rootScope.nowPlaying.id){
            $http.put(base + "api/song/skip/" + $rootScope.nowPlaying.id+"/"+$rootScope.nowPlaying.elapsed, "");
        }
        $scope.playNext();
    };

    $scope.getSongVote = function(){
        if($rootScope.nowPlaying.id){
            $http.get(base+"api/song/"+$rootScope.nowPlaying.id+"/votes").then(function(response){
                if(!response.data.err){
                    $(".songRate").removeClass("rated");
                    if(response.data.vote)
                        $("#songRateUp").addClass("rated");
                    else
                        $("#songRateDown").addClass("rated");
                }
            });
        }
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

    $rootScope.$on("showSongList", function(evt, arg){
       $scope.showSongList(arg);
    });

});