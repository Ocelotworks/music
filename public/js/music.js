/*
 * Copyright Ocelotworks 2016
 */
var app = angular.module("music", []);
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

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