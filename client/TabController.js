/*
 * Copyright Ocelotworks 2016
 */

var scrollBound = false;

app.controller("TabController", function($scope, $templateRequest, $sce, $compile, $rootScope, $location){

    console.log("TAB CONTROLLER STARTED");

    $scope.tabs = [
        {
            name: "Home",
            icon: "fa-home",
            template: "home",
            location: "",
            nocache: true
        },
        {
            name: "Songs",
            icon: "fa-music",
            template: "songs",
            location: "songs",
            staggered: true
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
        },
        {
            name: "Stats",
            icon: "fa-area-chart",
            location: "stats",
            template: "stats",
            nocache: true
        }
    ];

    $scope.activeTab = 0;

    if($rootScope.userLevel >= 2)
        $scope.tabs.push({
            name: "Admin",
            icon: "fa-lock",
            location: "admin",
            template: "admin"
        });

    if($rootScope.christmas){
        $scope.tabs.splice(4, 0, {
           name: "Christmas",
            icon: "fa-tree",
            location: "",
            template: "songs/genre/aeb54483-0fa8-4a52-b394-bc021fe01021"
        });
    }

    $templateRequest("loading").then(function(template){
       $("#tabContainer").html(template);
    }, $scope.showErrorScreen);


    $scope.showErrorScreen = function(error){
        $scope.tabSwitching = false;
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
            var templateUrl = $sce.getTrustedResourceUrl("search/template/" + query+"?v="+Math.random());
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
        if($scope.tabSwitching)return console.warn("Tried to switch tab whilst tab was switching");
        $scope.tabSwitching = true;
        $scope.activeTab = $scope.tabs.indexOf(tab);
        $templateRequest("loading").then(function(template){
            $("#tabContainer").html(template);
        }, $scope.showErrorScreen);


        var templateUrl = $sce.getTrustedResourceUrl("templates/"+tab.template+(tab.staggered ? "/0" : "")+(tab.nocache ? "?v="+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            if(tab.staggered){
                template = '<div id="allSongs" class="songList visible fancyScroll playable" ng-controller="SongController">'+template+'</div>'
            }
            $compile($("#tabContainer").html(template).contents())($scope);
            $scope.tabSwitching = false;
            if(tab.staggered){
                tab.loaded = 0;
            }
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


    if(!scrollBound){
        console.log("Binding scroll event");
        scrollBound = true;
        var isAppending = false;
        var tabContainer = $("#tabContainer");
        tabContainer.bind("scroll", function(){
            var tab = $scope.tabs[$scope.activeTab];
            if(tab.staggered && !isAppending && tabContainer.scrollTop()/tabContainer.prop("scrollHeight") > 0.7){
                isAppending = true;
                var templateUrl = $sce.getTrustedResourceUrl("templates/"+tab.template+"/"+(tab.loaded+100)+(tab.nocache ? "?v="+Math.random() : ""));
                $templateRequest(templateUrl).then(function(template){
                    console.log("Appending "+tab.loaded);
                    if(template.length > 10){
                        tabContainer.contents(tabContainer.contents(0, tabContainer.contents().length-6)).append(template+"</div>");
                        $compile(tabContainer.contents())($scope);
                        tab.loaded += 100;
                        isAppending = false;
                    }
                }, $scope.showErrorScreen);
            }
        });
    }


    $rootScope.$emit("tabControllerReady");
});