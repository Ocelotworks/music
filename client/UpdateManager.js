/*
 * Copyright Ocelotworks 2016
 */

const websocketBase = "wss://unacceptableuse.com/petify/ws";

function initialiseWebsocket($rootScope){

    $rootScope.serverIssues = false;

    $rootScope.messages = [];

    //{name: "Device Name", id: "Device ID"}
    $rootScope.playOnDevice = null;

    setInterval(function(){
        $rootScope.messages.forEach(function(message, index){
           message.lifetime--;
            if(message.lifetime <= 0){
                $(".message[data-index="+index+"]").fadeOut(400, function(){
                    $rootScope.messages.splice(index, 1);
                    console.log($rootScope.messages);
                });
            }
        });
    }, 1000);

    $rootScope.updateSocket = new WebSocket(websocketBase+"/updates");

    $rootScope.updateSocket.onerror = function(err){
        console.error("Websocket disconnected... Retrying in 2 seconds");
        $rootScope.serverIssues = true;
        $rootScope.$apply();
        console.log($rootScope.serverIssues);
        setTimeout(function(){
            initialiseWebsocket($rootScope);
        }, 2000);//
    };

    $rootScope.sendSocketMessage = function(type, payload){
        $rootScope.updateSocket.send(JSON.stringify({type: type, message: payload}));
    };

    $rootScope.updateSocket.onopen = function(){
        console.log("Connected");
        $rootScope.serverIssues = false;
        if($rootScope.settings.deviceID && $rootScope.settings.deviceID !== "gtfo"){
            $rootScope.sendSocketMessage("registerDevice", $rootScope.settings.deviceID);
        }
    };

    $rootScope.updateSocket.onmessage = function(message){
        var data = JSON.parse(message.data);
        if(data && data.type && data.message){
            switch(data.type){
                case "alert":
                    $rootScope.messages.push(data.message);
                    break;
                case "rejectDevice":
                    if(data.message == "INVALID_DEVICE")
                        localStorage.removeItem("deviceID");
                    break;
                case "updateDevices":
                    $rootScope.settings.connectedDevices = data.message;
                    break;
                case "play":
                    $rootScope.playById(data.id);
                    break;
                case "seek":
                    $rootScope.audioPlayer.seek(data.seconds);
                    break;
                case "volume":
                    $rootScope.audioPlayer.volume = data.volume;
                    break;
                case "log":
                    var console = $("#adminServerConsole");
                    if(console.text().length > 10000)console.text(console.text().substring(10000));
                    console.append("\n"+data.message).scrollTop(console[0].scrollHeight - console.height());
                    break;
                case "clearLogs":
                    console.log("Clearing logs");
                    $("#adminServerConsole").empty().append("Connected!");
                    break;
                default:
                    console.warn("Unknown message type: "+data.type);

            }
        }
    };
}