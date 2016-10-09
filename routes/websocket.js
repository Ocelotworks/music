/*
* Copyright Ocelotworks 2016
*/

var express = require('express');
var router = express.Router();


module.exports = function(app){

    router.ws('/updates/', function updateWebsocketConnect(ws, req){
        app.log((req.user ? req.user.username : "A client")+" connected to the websocket")
    });

    router.broadcastUpdate = function(message){
        app.expressWs.getWss('/ws/updates/').clients.forEach(function(client){
           client.send(message);
        });
    };

    return router;
};