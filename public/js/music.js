/*
 * Copyright Ocelotworks 2016
 */

var base = "https://unacceptableuse.com/petify/";
var app = angular.module("music", ['rzModule']);

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

app.filter('integer', function() {
    return function(input) {
        return parseInt(input);
    };
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.run(['$rootScope', function($rootScope){

    $("#albumArt").error(function(){
       $(this).attr('src', "img/album.png");
    });

    $(document).bind("mousedown", function (e) {
        if (!$(e.target).parents(".contextMenu").length > 0)
            $(".contextMenu").hide(100);
    });

    $rootScope.progressBar = {
        options: {
            showSelectionBar: true,
            ceil: 100,
            floor: 0,
            onChange: function(unk1, val, unk2, unk3){
                $rootScope.audioPlayer.currentTime = val;
            },
            translate: function(){
                return "";
            }
        },
        volumeOptions: {
            showSelectionBar: true,
            ceil: 1,
            step: 0.01,
            hideLimitLabels: true,
            precision: 2,
            floor: 0,
            translate: function(val){
                return parseInt(val*100)+"%";
            }
        }
    };

    $rootScope.settings = {
        shuffle: true,
        repeat: false,
        autoplay: true
    };

    $rootScope.nowPlaying =  {
            artist: "Nobody",
            album: null,
            title: "Nothing",
            duration: 0,
            normalPlay: false,
            elapsed: 0,
            playing: false,
            buffered: 0,
            buffering: false
        };


    $rootScope.queue = [];


    $rootScope.getSongById = function(id){
        return $(".song[data-id='"+id+"']").get(0);
    };

    $rootScope.addToQueueById = function(id){
        $rootScope.addToQueue($rootScope.getSongById(id));
    };

    $rootScope.addToQueue = function(element){
        var info = element.outerText.split("\u00A0-\u00A0");
        var songObject = {
            artist:  info[0],
            title: info[1],
            id: element.attributes["data-id"].value
        };
        $rootScope.queue.push(songObject);
    };

    $rootScope.queueNextById = function(id){
      $rootScope.queueNext($rootScope.getSongById(id));
    };

    $rootScope.queueNext = function(element){
        var info = element.outerText.split("\u00A0-\u00A0");
        var songObject = {
            artist:  info[0],
            title: info[1],
            id: element.attributes["data-id"].value
        };
        $rootScope.queue.unshift(songObject);
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
        $rootScope.nowPlaying.normalPlay = false;
        console.log("Can play");
    };


    $rootScope.audioPlayer.onplaying = function(){
        $rootScope.nowPlaying.playing = true;
        console.log("playing");
    };

    $rootScope.audioPlayer.ontimeupdate = function(){
        $rootScope.nowPlaying.elapsed = $rootScope.audioPlayer.currentTime;
        $rootScope.$apply();
        $rootScope.nowPlaying.buffering = false;
        $rootScope.nowPlaying.normalPlay = $rootScope.audioPlayer.currentTime > 1;
    };

    $rootScope.audioPlayer.onpause = function(){
        $rootScope.nowPlaying.playing = false;
    };

    $rootScope.audioPlayer.onloadeddata = function(){
        console.log("No longer buffering");
        $rootScope.nowPlaying.buffering = false;
    };

    $rootScope.audioPlayer.ondurationchange = function(){
        $rootScope.nowPlaying.duration = $rootScope.audioPlayer.duration;
        $rootScope.progressBar.options.ceil = parseInt($rootScope.nowPlaying.duration);
        $rootScope.nowPlaying.normalPlay = false;
    };

    $rootScope.audioPlayer.onstalled = function(){
        console.log("Buffering");
        $rootScope.nowPlaying.buffering = true;
    };

    $rootScope.audioPlayer.onvolumechange = function(){
        console.log("Aye lad the volume changed");
    };

    $rootScope.audioPlayer.onended = function(){
        if($rootScope.settings.autoplay){
            if($rootScope.settings.repeat)
                $rootScope.audioPlayer.currentTime = 0;
            else
                $rootScope.playNext();
        }
    };

    $rootScope.playNext = function playNext(){
        $rootScope.nowPlaying.normalPlay = false;
        if($rootScope.queue.length > 0){
            var nextSong = $rootScope.queue.shift();
            $rootScope.playById(nextSong.id);
        }else{
            var availableSongs = $(".songList.playable:visible .song");
            $rootScope.playByElement(availableSongs[parseInt(Math.random() * availableSongs.length)]);
        }
    };


    $rootScope.playById = function playById(id){
        $rootScope.playByElement($rootScope.getSongById(id));
    };

    $rootScope.playByElement = function playByElement(element){
        if(!element)return console.warn("Warning: playByElement called with a null element! Bad ID somewhere?");
        var info = element.outerText.split("\u00A0-\u00A0");
        $rootScope.nowPlaying.artist = info[0];
        $rootScope.nowPlaying.title = info[1];
        $rootScope.nowPlaying.buffering = true;
        $rootScope.audioPlayer.src = base+"song/"+element.attributes["data-id"].value;
        $("#albumArt").attr("src", base+"album/"+element.attributes["data-album"].value);
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
    };

    $scope.$on("switchTab", function(evt, tab){
        $scope.switchTab($scope.tabs[tab]);
    });
});

app.controller('AddController', function($scope,  $templateRequest, $sce, $compile, $http){

    $scope.addViews = {
        playlist: "playlist",
        song: "song#"+Math.random(),
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
        console.log($scope.song);
        $http.post(base+"templates/add/song", $scope.song)
        .then(function(response){
            if(!response.data.err){
                console.log("Aye aye cpn");
                var templateUrl = $sce.getTrustedResourceUrl("templates/add/song#"+Math.random());
                $templateRequest(templateUrl).then(function(template){
                    $compile($("#tabContainer").html(template).contents())($scope);
                }, $scope.showErrorScreen);
            }else{
                $scope.err = response.data.err;
            }
        },
        function(err){
            $scope.err = err;
            console.log("There was an error: "+err);
        });
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

app.controller('SongController', function($scope, $rootScope, $sce, $templateRequest, $compile){

    $scope.playSong = function(event){
        $rootScope.playByElement(event.target);
    };


    $scope.showSongContextMenu = function(event){
        $("#songContextMenu").finish().toggle(100).css({left: event.pageX, top: event.pageY, display: "absolute"}).data("id", event.target.attributes["data-id"].value);
    };


    $scope.togglePlaying = function(){
        console.log("Toggling??");
        if($rootScope.audioPlayer.paused)
            $rootScope.audioPlayer.play();
        else
            $rootScope.audioPlayer.pause();
    };


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.showSongList = function(template){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/songs/"+template);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

    };

    $scope.playArtist = function(id){
        $scope.showSongList("artist/"+id);
    };


    $scope.playAlbum = function(id){
        $scope.showSongList("album/"+id);
    };

    $scope.playPlaylist = function(id){
        $scope.showSongList("playlist/"+id);
    };

});

app.controller("ModalController", function($scope, $rootScope, $sce, $templateRequest, $compile){
    $templateRequest("loading").then(function(template){
        $compile($("#modalBox").html(template).contents())($scope);
    }, $scope.showErrorScreen);


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.openModal = function(path, nocache){
        $("#modalShadow").addClass("modal-visible");
        $templateRequest("loading").then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/"+path+(nocache ? "#"+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

    $scope.closeModal = function(){
        $("#modalShadow").removeClass("modal-visible");
    };

    $rootScope.$on("openModal", function(evt, path, nocache){
        console.log("Received openmodal event");
        $scope.openModal(path, nocache)
    });

    $rootScope.$on("closeModal", $scope.closeModal);

    $("#modalShadow").click(function(e){
        if(e.target != this) return;
        $scope.closeModal();
    });


});

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

app.controller("AddPlaylistController", function($scope, $http){
    $scope.checkAll = function(){
        $(".songSelect").prop("checked", true)
    };

    $scope.uncheckAll = function(){
        $(".songSelect").prop("checked", false)
    };

    $scope.invertAll = function(){
        $(".songSelect").prop("checked",  function(_, checked) {
            return !checked;
        });
    };

    $scope.createPlaylist = function(){
        $http.post(base+"templates/add/playlist", $scope.playlist).then(function(response){
            if(!response.data.err){
                $scope.$emit("switchTab", 4)
            }else{
                $scope.err = response.data.err;
            }
        },
        function(err){
            $scope.err = err;
            console.log("There was an error: "+err);
        });
    }
});

app.controller("PlaylistController", function($scope){
   //tbc
});
