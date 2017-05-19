/**
 * Created by Peter on 29/01/2017.
 */


module.exports = function(app){
    return {
        name: "Device Handler",
        handlers: {
            "registerDevice": function registerDeviceHandler(client, req, message) {
                app.log("Registering device " + message.message);
                if (!client.user) {
                    app.sendUpdate(client, "rejectDevice", "NOT_LOGGED_IN");
                } else if (message.message && message.message.length === 36) {
                    app.database.getDeviceInfo(message.message, function getDeviceInfoCB(err, result) {
                        if (err) {
                            app.warn("Error getting device info: " + err);
                            app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                        } else {
                            var device = result[0];
                            if (device.owner === client.user.id) {
                                app.database.addDeviceSocket({
                                    device: device.id,
                                    user: client.user.id
                                }, function(err, result){
                                    if(err){
                                        app.error(`Error registering device ${device.id} to socket belonging to ${client.user.id}`);
                                    }else{
                                        app.log(`Device ${device.id} registered to ${client.user.id} on socket ID ${result[0]}`);
                                        client.id = result[0];
                                        client.device = device;
                                        app.deviceClients[client.id] = client;
                                    }
                                });
                                app.database.getDevicesByUser(client.user.id, function getDevicesByUserCB(err, resp){
                                    if(err)
                                        app.error(`Error getting devices by user ${client.user.id}: ${err}`);
                                    else
                                        app.broadcastUpdateToUser(client.user.id, "updateDevices", resp);
                                });

                                app.database.updateDeviceLastSeen(device.id, function updateDeviceLastSeenCB(err) {
                                    if (err) app.warn("Error updating last seen for device: " + err);
                                });
                            } else {
                                app.warn("User " + req.user.id + " (" + req.user.username + ") tried to register a device that didn't belong to them, " + device.id);
                                app.warn("Device belongs to " + device.owner);
                                app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                            }
                        }
                    });
                } else {
                    app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                    app.warn("User " + req.user.id + " (" + req.user.username + ") tried to register an invalid device ID: " + message.message);
                }
            },
            "receiveSongUpdates": function setReceiveSongUpdates(client, req, message){
                app.log("Device wants to receive song updates");
                if(!client.user){
                    app.sendUpdate(client, "error", "NOT_LOGGED_IN");
                }else{
                    if(client.id){
                        app.database.modifyDeviceSocket(client.id, {
                            receiveSongUpdates: !!message.message
                        }, function modifyDeviceSocketID(err){
                            if(err){
                                app.error(`Error modifying device socket entry for device Socket ID ${client.id}: ${err}`);
                            }else{
                                client.receiveSongUpdates = !!message.message;
                                app.log(`Client ${client.id} is now ${!message.message ? "no longer" : ""} receiving song updates.`);
                            }
                        });
                    }else{
                        app.sendUpdate(client, "error", "DEVICE_NOT_REGISTERED");
                    }
                }
            },
            "songUpdate": function recieveSongUpdate(client, req, message){
                if(!client.user){
                    app.sendUpdate(client, "error", "NOT_LOGGED_IN");
                }else if(message.message.type){
                    app.database.getDeviceSocketsWithProp("receiveSongUpdates", function(err, result){
                        if(err){
                            app.error("Error getting device sockets: "+err);
                        }else
                        for(var i in result){
                            var device = result[i];
                            var deviceClient = app.deviceClients[device.id];
                            if(client.device && client.device.id)
                                message.message.device = client.device.id;
                            if(deviceClient && deviceClient.readyState){
                                app.sendUpdate(deviceClient, "songUpdate", message.message);
                            }else{
                                app.warn(`Device socket ${device.id} does not exist or is closed.`);
                            }
                        }
                    });
                }
            }
        }
    };
};


