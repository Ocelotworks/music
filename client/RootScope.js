/*
* Copyright Ocelotworks 2016
 */

app.run(['$rootScope', '$http', function($rootScope, $http){

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
        autoplay: true,
        showShuffleQueue: false,
        connectedDevices: []
    };



    $rootScope.nowPlaying =  {
        artist: "Nobody",
        album: null,
        id: null,
        artistID: null,
        title: "Nothing",
        duration: 0,
        normalPlay: false,
        elapsed: 0,
        playing: false,
        buffered: 0,
        buffering: false
    };


    $rootScope.shuffleQueue = [];
    $rootScope.queue = [];
    $rootScope.historyStack = [];


    $rootScope.replenishShuffleQueue = function(){
        $http.get(base+"templates/songs/shuffleQueue").then(function(response){
            console.log(response);
           if(!response.data || response.data.err){
               console.error("Error replenishing shuffle queue: ");
               console.error(response);
           } else{
               Array.prototype.push.apply($rootScope.shuffleQueue, response.data);
           }
        });

    };

    $rootScope.getSongById = function(id){
        return $(".song[data-id='"+id+"']").get(0);
    };

    $rootScope.addToQueueById = function(id){
        $rootScope.addToQueue($rootScope.getSongById(id));
    };

    $rootScope.addToQueue = function(element){
        console.log(element);
        var info = (element.outerText || element.textContent).split("\u00A0-\u00A0");
        var songObject = {
            artist:  info[0],
            title: info[1],
            id: element.attributes["data-id"].value,
            album: element.attributes["data-album"].value,
            artistID: element.attributes["data-artist"].value
        };
        $rootScope.queue.push(songObject);
    };

    $rootScope.queueNextById = function(id){
        $rootScope.queueNext($rootScope.getSongById(id));
    };

    $rootScope.queueNext = function(element){
        var info = (element.outerText || element.textContent).split("\u00A0-\u00A0");
        var songObject = {
            artist:  info[0],
            title: info[1],
            id: element.attributes["data-id"].value,
            album: element.attributes["data-album"].value,
            artistID: element.attributes["data-artist"].value
        };
        $rootScope.queue.unshift(songObject);
    };

    $rootScope.removeFromQueue = function(index){
        $rootScope.queue.splice(index, 1);
    };

    $rootScope.queueMoveUp = function(index){
        $rootScope.queue.move(index, index-1);
    };

    $rootScope.queueMoveDown = function(index){
        $rootScope.queue.move(index, index+1);
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
        $rootScope.nowPlaying.normalPlay = false;
        console.log("Can play");
        $rootScope.audioPlayer.play();
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

    $rootScope.replenishShuffleQueue();

    $rootScope.playLast = function(){
        console.log("Playing from stack");
        console.log(JSON.stringify($rootScope.historyStack));
        if($rootScope.historyStack.length > 0){
            if($rootScope.nowPlaying.id !== null){
                $rootScope.shuffleQueue.unshift(newInstance($rootScope.nowPlaying));
            }
            $rootScope.playByData($rootScope.historyStack.pop());
        }
    };

    $rootScope.playNext = function playNext(){
        $rootScope.nowPlaying.normalPlay = false;
        if($rootScope.nowPlaying.id !== null) {
            console.log("Pushing on to history stack:");
            console.log($rootScope.nowPlaying);
            $rootScope.historyStack.push(newInstance($rootScope.nowPlaying));
            console.log("History stack is now");
            console.log($rootScope.historyStack);
            if ($rootScope.nowPlaying.elapsed / $rootScope.nowPlaying.duration > 0.5) {
                $http.put(base + "templates/add/play/" + $rootScope.nowPlaying.id, "").then(function () {
                });
            }
        }
        var nextSong;
        if($rootScope.queue.length > 0) {
            nextSong = $rootScope.queue.shift();
            $rootScope.playById(nextSong.id);
        }else{
            if($rootScope.shuffleQueue.length > 0){
                nextSong = $rootScope.shuffleQueue.shift();
                $rootScope.playByData(nextSong);
                if($rootScope.shuffleQueue.length <= 5)
                    $rootScope.replenishShuffleQueue();
            }else{
                var availableSongs = $(".songList.playable:visible .song");
                $rootScope.playByElement(availableSongs[parseInt(Math.random() * availableSongs.length)]);
            }
        }
        $rootScope.audioPlayer.play();
    };

    $rootScope.playByData = function playByData(data){
        $(".songRate").removeClass("rated");
        $rootScope.nowPlaying.id = data.id;
        $rootScope.nowPlaying.artistID = data.artistID;
        $rootScope.nowPlaying.artist = data.artist;
        $rootScope.nowPlaying.title = data.title;
        $rootScope.nowPlaying.buffering = true;
        $rootScope.audioPlayer.src = base+"song/"+data.id;
        $("#albumArt").attr("src", base+"album/"+data.album);
        if(window.innerWidth <= 1111){
            changeFavicon(base+"album/"+data.album);
            document.title =  data.artist + " - " + data.title;
        }
    };

    $rootScope.httpPost = function(url, data){
        $http.post(url, data);
    };

    $rootScope.httpGet = function(url){
        $http.get(url);
    };

    $rootScope.playById = function playById(id){
        $rootScope.playByElement($rootScope.getSongById(id));
    };

    $rootScope.playByElement = function playByElement(element){
        if(!element)return console.warn("Warning: playByElement called with a null element! Bad ID somewhere?");
        $(".songRate").removeClass("rated");
        var info = (element.outerText || element.textContent).split("\u00A0-\u00A0");
        $rootScope.nowPlaying.id = element.attributes["data-id"].value;
        $rootScope.nowPlaying.artistID = element.attributes["data-artist"].value;
        $rootScope.nowPlaying.artist = info[0];
        $rootScope.nowPlaying.title = info[1];
        $rootScope.nowPlaying.buffering = true;
        $rootScope.audioPlayer.src = base+"song/"+element.attributes["data-id"].value;
        $("#albumArt").attr("src", base+"album/"+element.attributes["data-album"].value);
        if(window.innerWidth <= 1111){
            changeFavicon(base+"album/"+element.attributes["data-album"].value);
            document.title = info[0] + " - " + info[1];
        }

    };

    $rootScope.setDevice = function setDevice(id, name){
        $rootScope.playOnDevice = $rootScope.settings.deviceID == id ? null : {name: name, id: id};
        $rootScope.$emit('closeModal');
    };

    $rootScope.$on("modalControllerReady", function(){
        if(localStorage) {
            if($rootScope.loggedIn){
                if(localStorage.getItem("deviceID")){
                    console.log("Found valid device ID");
                    $rootScope.settings.deviceID = localStorage.getItem("deviceID");
                }else{
                    console.log("Nagging for deviceID...");
                    $rootScope.$emit("openModal", "modals/newDevice");
                }
            }else{
                console.log("Not logged in");
            }
        }else{
            incompatibleBrowser();
        }
        initialiseWebsocket($rootScope);
    });

}]);