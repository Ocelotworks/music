/*
 * Copyright Ocelotworks 2016
 */

app.controller("ContextMenuController", function($scope, $rootScope){
    $scope.ctxPlayNext = function(event){
        var contextMenu = $("#songContextMenu");
        $rootScope.queueNextById(contextMenu.data("id"));
        contextMenu.toggle(100);
    };

    $scope.ctxAddToQueue = function(event){
        var contextMenu = $("#songContextMenu");
        $rootScope.addToQueueById(contextMenu.data("id"));
        contextMenu.toggle(100);
    };

    $scope.ctxSongInfo = function(event){
        //console.log("Opening a wee modal");
        var contextMenu = $("#songContextMenu");
        $rootScope.$emit("openModal", "songInfo/"+contextMenu.data("id"), false);
        contextMenu.toggle(100);
    };
});