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
                } else if (message.message && message.message.length == 36) {
                    app.database.getDeviceInfo(message.message, function getDeviceInfoCB(err, result) {
                        if (err) {
                            app.warn("Error getting device info: " + err);
                            app.sendUpdate(client, "rejectDevice", "INVALID_DEVICE");
                        } else {
                            var device = result[0];
                            app.deviceClients[device.id] = client;
                            if (device.owner == client.user.id) {
                                client.device = device;
                                if (app.connectedDevices[client.user.id]) {
                                    app.connectedDevices[client.user.id].push(device);
                                } else {
                                    app.connectedDevices[client.user.id] = [device];
                                }
                                app.broadcastUpdateToUser(client.user.id, "updateDevices", app.connectedDevices[client.user.id]);
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
            }
        }
    };
};