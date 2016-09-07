/*
 * Copyright Ocelotworks 2016
 */

var base = "http://localhost:3002/";
var app = angular.module("music", []);
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.run(['$rootScope', function($rootScope){
    console.log("Yarrr matey");

    $rootScope.nowPlaying =  {
            artist: "Nobody",
            album: null,
            title: "Nothing",
            duration: 0,
            elapsed: 0,
            playing: false
        };


    $rootScope.audioPlayer = new Audio();

    /*
     const unsigned short MEDIA_ERR_ABORTED = 1;
     const unsigned short MEDIA_ERR_NETWORK = 2;
     const unsigned short MEDIA_ERR_DECODE = 3;
     const unsigned short MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
     */
    $rootScope.audioPlayer.onerror = function(){
        console.error("Error: "+audioPlayer.error.code);
    };

    $rootScope.audioPlayer.oncanplay = function(){
        $rootScope.audioPlayer.play();
    };

    $rootScope.audioPlayer.onplaying = function(){
        $rootScope.nowPlaying.playing = true;
    };

    $rootScope.audioPlayer.onpause = function(){
        $rootScope.nowPlaying.playing = false;
    };

    $rootScope.audioPlayer.durationchange = function(){
        $rootScope.nowPlaying.duration = $rootScope.audioPlayer.duration;
    };


    $rootScope.audioPlayer.stalled = function(){
        console.log("Buffering");
    };

    $rootScope.audioPlayer.timeupdate = function(){
        $rootScope.nowPlaying.elapsed = $rootScope.mediaPlayer.elapsed;
    };

    $rootScope.audioPlayer.volumechange = function(){
        console.log("Aye lad the volume changed");
    };



}]);

app.controller("TabController", function($scope, $templateRequest, $sce, $compile){

    $scope.tabs = [
        {
            name: "Songs",
            icon: "fa-music",
            template: "songs",
            default: "selected"
        },
        {
            name: "Artists",
            icon: "fa-user",
            template: "artists"
        },
        {
            name: "Albums",
            icon: "fa-square",
            template: "albums"
        },
        {
            name: "Genres",
            icon: "fa-list",
            template: "genres"
        },
        {
            name: "Playlists",
            icon: "fa-th-list",
            template: "playlists"
        },
        {
            name: "Radio",
            icon: "fa-fast-forward",
            template: "radio"
        },
        {
            name: "Add",
            icon: "fa-plus",
            template: "add"
        }
    ];

    $templateRequest("loading").then(function(template){
        $compile($("#tabContainer").html(template).contents())($scope);
        $scope.switchTab($scope.tabs[0]);
    }, $scope.showErrorScreen);

    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.switchTab = function(tab){
        //TODO: Angular if statement for this?
        for(var i in $scope.tabs)
            if($scope.tabs.hasOwnProperty(i))
                $scope.tabs[i].default = null;
        tab.default = "selected";
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/"+tab.template);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

    }
});


app.controller('AddController', function($scope,  $templateRequest, $sce, $compile){

    $scope.addViews = {
        playlist: "playlist",
        song: "song",
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

    $scope.addSong = function(){
        console.log($scope.addSongForm);
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




app.controller('SongController', function($scope, $rootScope){

    $scope.playSong = function(event){
        var info = event.target.outerText.split("\u00A0-\u00A0");
        $rootScope.nowPlaying = {
            artist: info[0],
            title: info[1]
        };
        $rootScope.audioPlayer.src = base+"song/"+event.target.attributes["data-id"].value;
    } ;
});