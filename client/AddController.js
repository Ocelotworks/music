/*
 * Copyright Ocelotworks 2016
 */
app.controller('AddController', function($scope,  $templateRequest, $sce, $compile, $http, $rootScope){

    $scope.addViews = {
        playlist: "playlist",
        song: "song#"+Math.random(),
        radio: "radio"
    };

    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.song = {
        songFolder: "pop",
        getLastfmData: true

    };

    $scope.openPlaylistChooser = function(){
        if(!$scope.song.addToPlaylist) {
            if ($scope.song.playlist)
                $scope.song.playlist = null;
        }else{
            $rootScope.$emit('openModal', 'modals/addToPlaylist/new', true);
        }
    };

    $scope.retry = function(song){
        $http.get(base+"api/downloader/"+song+"/retry").then($scope.refresh);
    };

    $scope.refresh = function(){
        console.log("Refreshing add view");
        var templateUrl = $sce.getTrustedResourceUrl("templates/add/song#"+Math.random());
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

    $scope.addSong = function(){
        console.log($scope.song);
        $http.post(base+"api/downloader/add", $scope.song)
            .then(function(response){
                $scope.song.url = "";
                if(!response.data.err){
                   $scope.refresh();
                }else{
                    $scope.err = response.data.err;
                }
            },
            function(err){
                $scope.err = err;
                console.log("There was an error: "+err);
            });
    };

    $rootScope.$on("selectPlaylist", function(evt, playlist, name){
        $scope.song.playlist = playlist;
        $scope.song.playlistName = name;
        $scope.song.addToPlaylist = true;
    });

    $rootScope.$on("closeModal", function(evt, cancelled){
       if(cancelled){
           $scope.song.addToPlaylist = false;
           $rootScope.$apply();
       }
    });

    $scope.clearFailed = function(){
        $http.get(base+"api/downloader/clearFailed").then(function(){
            $scope.refresh();
        });
    };

    $scope.createAddView = function(type){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/add/"+$scope.addViews[type]);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

});