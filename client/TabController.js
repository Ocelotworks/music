/*
 * Copyright Ocelotworks 2016
 */

app.controller("TabController", function($scope, $templateRequest, $sce, $compile, $rootScope){

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
            template: "playlists",
            nocache: true
        },
        {
            name: "Radio",
            icon: "fa-fast-forward",
            template: "radio",
            nocache: true
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

    $scope.switchTab = function(tab){
        //TODO: Angular if statement for this?
        for(var i in $scope.tabs)
            if($scope.tabs.hasOwnProperty(i))
                $scope.tabs[i].default = null;
        tab.default = "selected";
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/"+tab.template+(tab.nocache ? "#"+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        if(window.innerWidth <= 1111){
            console.log("Aye aye cap'n");
           $(".hamburger").prop("checked", false);
        }else{
            console.log(window.innerWidth);
        }
    };

    $scope.$on("switchTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });

    $rootScope.$on("switchTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });
});