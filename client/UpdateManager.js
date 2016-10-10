/*
 * Copyright Ocelotworks 2016
 */

const websocketBase = "wss://unacceptableuse.com/petify/ws";

function initialiseWebsocket($rootScope){

    $rootScope.serverIssues = false;

    $rootScope.messages = [];


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
        }, 2000);
    };

    $rootScope.updateSocket.onopen = function(){
        console.log("Connected");
        $rootScope.serverIssues = false;
    };

    $rootScope.updateSocket.onmessage = function(message){
        var data = JSON.parse(message.data);
        if(data && data.type && data.message){
            switch(data.type){
                case "alert":
                    $rootScope.messages.push(data.message)
            }
        }
    };
}