/*
 * Copyright Ocelotworks 2016
 */

app.controller('SongController', function($scope, $rootScope, $sce, $templateRequest, $compile){

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
        $scope.showSongList("artist/"+id);
    };


    $scope.playAlbum = function(id){
        $scope.showSongList("album/"+id);
    };

    $scope.playPlaylist = function(id){
        $scope.showSongList("playlist/"+id);
    };
});