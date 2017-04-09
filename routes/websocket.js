/*
* Copyright Ocelotworks 2016
*/

var express = require('express');
var router = express.Router();




module.exports = function(app){

    router.petifyInfo = {
        name: "Websocket",
        route: "/ws"
    };

    app.connectedDevices = {};
    app.deviceClients = {};
    app.websocketHandlers = {};

    app.registerWebsocketHandler = function registerWebsocketHandler(handler){
        app.log(`Registering websocket handler ${handler.name}`);
        app.websocketHandlers = Object.assign(app.websocketHandlers, handler.handlers);
    };

    app.registerWebsocketHandler(require("../websocket/deviceHandler.js")(app));
    app.registerWebsocketHandler(require("../websocket/adminHandler.js") (app));

    function updateWebsocketConnect(client, req){
        if(req.params.key)
            app.database.getUserFromApiKey(req.params.key, function(err, user){
                if(!err && user && user[0]) {
                    req.user = user[0];
                    client.user = user[0];
                    app.log("Websocket authed as "+user[0].username+" using API key.");
                }else{
                    app.log("Incorrect API key used");
                    client.close();
                }
            });
        else
            app.log((req.user ? req.user.username : "A client")+" connected to the websocket");

        client.user = req.user;
        client.on("message", function wsMessageHandler(data){
            try {
                var message = JSON.parse(data);
                if(message.type){
                    if(app.websocketHandlers[message.type]){
                        app.websocketHandlers[message.type](client, req, message);
                    }else{
                        app.warn(`Unknown message type ${message.type} from ${client.user ? client.user.username : "Guest"}`)
                    }
                }else{
                    app.warn(`Received message with no message type: ${JSON.stringify(message)}`);
                }
            }catch(e){
                app.warn("Caught exception from incoming message: "+e);
                app.warn("Message: "+data);
                if(client.user)
                    app.warn("Offending user: "+client.user.id+" ("+client.user.username+")");
            }
        });

        client.on('close', function websocketClose(){
            if(client.device){
                app.deviceClients[client.device.id] = null;
                if(client.user && app.connectedDevices[client.user.id]){
                    var devices = app.connectedDevices[client.user.id];
                    var index = devices.indexOf(client.device);
                    if(index > -1){
                        devices.splice(index, 1);
                        app.log("Removed device");
                    }
                }
            }
            app.log((req.user ? req.user.username : "A client")+" disconnected from the websocket");

        });
    }


    router.ws('/updates/', updateWebsocketConnect);
    router.ws('/updates/:key', updateWebsocketConnect);

    app.broadcastUpdate = function(type, message){
        app.expressWs.getWss('/ws/updates/').clients.forEach(function(client){
            app.sendUpdate(client, type, message);
        });
    };

    app.broadcastUpdateToUser = function(user, type, message){
        app.expressWs.getWss('/ws/updates/').clients.forEach(function(client){
            if(client.user && client.user.id == user)
               app.sendUpdate(client, type, message);
        });
    };

    app.sendUpdate = function(client, type, message){
        if(client.readyState == 1) //You know what? fuck you. I'm not including an entire fucking package just for the enums, this is SOCKET FUCKING OPEN, and theres no docs for express-ws, happy?
            client.send(JSON.stringify({type: type, message: message}));
    };

    return router;
};