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

    $scope.ctxAddToPlaylist = function(event){
        var contextMenu = $("#songContextMenu");
        $rootScope.$emit("openModal", "modals/addToPlaylist/"+contextMenu.data("id"), false);
        contextMenu.toggle(100);
    };

    $scope.ctxSongInfo = function(event){
        var contextMenu = $("#songContextMenu");
        $rootScope.$emit("openModal", "modals/songInfo/"+contextMenu.data("id"), false);
        contextMenu.toggle(100);
    };

    $scope.ctxViewAlbum = function(){
        var contextMenu = $("#songContextMenu");
        $rootScope.$emit("showSongList", "album/"+contextMenu.data("album"), false);
        contextMenu.toggle(100);
    };

    $scope.ctxViewArtist = function(){
        var contextMenu = $("#songContextMenu");
        $rootScope.$emit("showSongList", "artist/"+contextMenu.data("artist"), false);
        contextMenu.toggle(100);
    };
});