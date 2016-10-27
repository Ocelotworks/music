/*
 * Copyright Ocelotworks 2016
 */

app.controller("TabController", function($scope, $templateRequest, $sce, $compile, $rootScope, $location){

    console.log("TAB CONTROLLER STARTED");

    $scope.tabs = [
        {
            name: "Songs",
            icon: "fa-music",
            template: "songs",
            location: "songs",
            default: "selected"
        },
        {
            name: "Artists",
            icon: "fa-user",
            location: "artists",
            template: "artists"
        },
        {
            name: "Albums",
            icon: "fa-square",
            location: "albums",
            template: "albums"
        },
        {
            name: "Genres",
            icon: "fa-list",
            location: "genres",
            template: "genres"
        },
        {
            name: "Playlists",
            icon: "fa-th-list",
            location: "playlists",
            template: "playlists",
            nocache: true
        },
        {
            name: "Radio",
            icon: "fa-fast-forward",
            location: "radio",
            template: "radio",
            nocache: true
        },
        {
            name: "Add",
            icon: "fa-plus",
            location: "add",
            template: "add"
        }
    ];

    if($rootScope.userLevel >= 2)
        $scope.tabs.push({
            name: "Admin",
            icon: "fa-lock",
            location: "admin",
            template: "admin"
        });

    $templateRequest("loading").then(function(template){
       $("#tabContainer").html(template);
    }, $scope.showErrorScreen);


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.search = debounce(function(){
        var query = $("#searchBar").find(".search").val();
        if(query && query.length > 0) {
            var templateUrl = $sce.getTrustedResourceUrl("search/template/" + query);
            $templateRequest(templateUrl).then(function (template) {
                $compile($("#tabContainer").html(template).contents())($scope);
            }, $scope.showErrorScreen);
        }else{
            $scope.switchTab($scope.tabs[0]);
        }
    }, 150);

    $scope.showAddPlaylist = function(){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/add/playlist");
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

    $scope.tabSwitching = false;

    $scope.switchTab = function(tab){
        console.trace();
        if($scope.tabSwitching)return console.warn("Tried to switch tab whilst tab was switching");
        $scope.tabSwitching = true;
        //TODO: Angular if statement for this?
        for(var i in $scope.tabs)
            if($scope.tabs.hasOwnProperty(i))
                $scope.tabs[i].default = null;
        tab.default = "selected";
        $templateRequest("loading").then(function(template){
            $("#tabContainer").html(template);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/"+tab.template+(tab.nocache ? "#"+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
            $scope.tabSwitching = false;
        }, $scope.showErrorScreen);

        console.log("Setting location "+$location.path());
        $location.path("/"+tab.location);

        if(window.innerWidth <= 1111)
           $(".hamburger").prop("checked", false);
    };

    $scope.$on("switchTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });

    $rootScope.$on("switchTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });

    $rootScope.$emit("tabControllerReady");
});