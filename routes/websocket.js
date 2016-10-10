/*
* Copyright Ocelotworks 2016
*/

var express = require('express');
var router = express.Router();


module.exports = function(app){

    router.ws('/updates/', function updateWebsocketConnect(ws, req){
        app.log((req.user ? req.user.username : "A client")+" connected to the websocket");
        ws.user = req.user;
        if(req.user)
            app.broadcastUpdate("alert", {
                lifetime: 5,
                title: "Sexy Test Alert",
                body: `${req.user.username} just logged in to petify.`,
                image: req.user.avatar
            });
    });

    app.broadcastUpdate = function(type, message){
        app.expressWs.getWss('/ws/updates/').clients.forEach(function(client){
           client.send(JSON.stringify({type: type, message: message}));
        });
    };

    return router;
};