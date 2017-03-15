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
    $scope.ctxPlayNext = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.queueNextById(contextMenu.data("id"));
        contextMenu.hide(100);
    };

    $scope.ctxAddToQueue = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.addToQueueById(contextMenu.data("id"));
        contextMenu.hide(100);
    };

    $scope.ctxAddToPlaylist = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.$emit("openModal", "modals/addToPlaylist/"+contextMenu.data("id"), false);
        contextMenu.hide(100);
    };

    $scope.ctxSongInfo = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.$emit("openModal", "modals/songInfo/"+contextMenu.data("id"), false);
        contextMenu.hide(100);
    };

    $scope.ctxViewAlbum = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.$emit("showSongList", "album/"+contextMenu.data("album"), false);
        contextMenu.hide(100);
    };

    $scope.ctxViewArtist = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.$emit("showSongList", "artist/"+contextMenu.data("artist"), false);
        contextMenu.hide(100);
    };

    $scope.ctxMoveToTop = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.queue.move(contextMenu.data("index"), 0);
        contextMenu.hide(100);
    };

    $scope.ctxRandomise = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.queue.move(contextMenu.data("index"), parseInt(Math.random() * $rootScope.queue.length));
        contextMenu.hide(100);
    };

    $scope.ctxMoveToBottom = function(){
        var contextMenu = $(".contextMenu:visible");
        $rootScope.queue.move(contextMenu.data("index"),$rootScope.queue.length);
        contextMenu.hide(100);
    };

    $scope.copyShareLink = function(){
        var contextMenu = $(".contextMenu:visible");
        var builtShareString = $rootScope.getSongById(contextMenu.data("id")).innerText.replace(/\s/g,"-").replace("---", "-");
        copyToClipboard(base+"song/"+contextMenu.data("id")+"/"+builtShareString);
        contextMenu.hide(100);
    }
});