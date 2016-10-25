/*
 * Copyright Ocelotworks 2016
 */

app.controller("SongInfoTabController", function($scope, $templateRequest, $sce, $compile, $rootScope){

    $scope.songId = $("#songInfoContainer").data("id");

    $scope.tabs = [
        {
            name: "Playlists",
            icon: "fa-list",
            template: "playlists",
            mode: "selected"
        }
    ];

    if($rootScope.userLevel >= 2){
        $scope.tabs.push({
            name: "Replace",
            icon: "fa-copy",
            template: "replace",
            cssClass: "userlevel-2"
        });
        $scope.tabs.push({
            name: "Edit",
            icon: "fa-pencil",
            template: "edit",
            cssClass: "userlevel-2"
        });
    }
    if($rootScope.userLevel >= 3){
        $scope.tabs.push( {
            name: "Delete",
            icon: "fa-trash",
            template: "delete",
            cssClass: "userlevel-3"
        });
    }

    $templateRequest("loading").then(function(template){
        $compile($("#modalTabContainer").html(template).contents())($scope);
    }, $scope.showErrorScreen);


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#modalTabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.switchTab = function(tab){
        for(var i in $scope.tabs)
            if($scope.tabs.hasOwnProperty(i))
                $scope.tabs[i].mode = null;
        tab.mode = "selected";
        $templateRequest("loading").then(function(template){
            $compile($("#modalTabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/modals/songInfo/"+$scope.songId+"/"+tab.template+(tab.nocache ? "#"+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            $compile($("#modalTabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

    };

    $scope.$on("switchSongInfoTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });

    $rootScope.$on("switchSongInfoTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });

    $scope.switchTab($scope.tabs[0]);

    //$rootScope.$emit("songInfoTabControllerReady");
});