/*
 * Copyright Ocelotworks 2016
 */

const websocketBase = "wss://unacceptableuse.com/petify/ws";

function initialiseWebsocket($rootScope){

    $rootScope.serverIssues = false;

    $rootScope.messages = [
        {
            title: "A test message",
            body: "A test body",
            image: "https://placekitten.com/300/300"
        },
        {
            title: "A test message",
            body: "A test body",
            image: "https://placekitten.com/300/300"
        },
        {
            title: "A test message",
            body: "A test body",
            image: "https://placekitten.com/300/300"
        }
    ];

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
        console.log("Recieved message: ");
        console.log(message);
    };
}