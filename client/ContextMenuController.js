/*
 * Copyright Ocelotworks 2016
 */

function copyToClipboard(text) {
    try {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }catch(e){
        prompt("Copy the share link below: ", text);
    }
}

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


    $scope.copyShareLink = function(){
        var contextMenu = $("#songContextMenu");
        var builtShareString = $rootScope.getSongById(contextMenu.data("id")).innerText.replace(/\s/g,"-").replace("---", "-");
        copyToClipboard(base+"song/"+contextMenu.data("id")+"/"+builtShareString);
        contextMenu.toggle(100);
    }
});