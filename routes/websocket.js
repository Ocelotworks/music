/*
* Copyright Ocelotworks 2016
*/

var express = require('express');
var router = express.Router();



module.exports = function(app){

    app.connectedDevices = {};
    app.deviceClients = {};

    router.ws('/updates/', function updateWebsocketConnect(client, req){
        app.log((req.user ? req.user.username : "A client")+" connected to the websocket");
        client.user = req.user;
        client.on("message", function wsMessageHandler(data){
            try {
                var message = JSON.parse(data);
                console.log(message);
                if(message.type){
                    switch(message.type){
                        case "registerDevice":
                            app.log("Registering device "+message.message);
                            if(!client.user){
                                app.sendUpdate(client, "rejectDevice", "NOT_LOGGED_IN");
                            }else if(message.message && message.message.length == 36){
                                app.database.getDeviceInfo(message.message, function getDeviceInfoCB(err, result){
                                    if(err){
                                        app.warn("Error getting device info: "+err);
                                        app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                                    }else{
                                        var device = result[0];
                                        app.deviceClients[device.id] = client;
                                        if(device.owner == client.user.id){
                                            client.device = device;
                                            if(app.connectedDevices[client.user.id]){
                                                app.connectedDevices[client.user.id].push(device);
                                            }else{
                                                app.connectedDevices[client.user.id] = [device];
                                            }
                                            app.broadcastUpdateToUser(client.user.id, "updateDevices", app.connectedDevices[client.user.id]);
                                            app.database.updateDeviceLastSeen(device.id, function updateDeviceLastSeenCB(err){
                                               if(err)app.warn("Error updating last seen for device: "+err);
                                            });
                                        }else{
                                            app.warn("User "+req.user.id+" ("+req.user.username+") tried to register a device that didn't belong to them, "+device.id);
                                            app.warn("Device belongs to "+device.owner);
                                            app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                                        }
                                   }
                                });
                            }else{
                                app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                                app.warn("User "+req.user.id+" ("+req.user.username+") tried to register an invalid device ID: "+message.message);
                            }
                            break;
                    }
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
                app.deviceClients.splice(app.deviceClients.indexOf(client.device), 1);
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
    });

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
        client.send(JSON.stringify({type: type, message: message}));
    };

    return router;
};