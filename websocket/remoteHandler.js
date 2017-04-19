/**
 * Created by Peter on 15/04/2017.
 */
module.exports = function(app){


    function validateRemote(client, message, cb){
        if (!client.user) {
            app.sendUpdate(client, "error", "NOT_LOGGED_IN");
        }else if(message.device && message.device.length === 36) {
            app.database.getDeviceInfo(message.device, function(err, resp){
               if(err || !resp[0] || resp[0].owner !== client.user.id){
                   if(err)
                       app.error("Error getting device info: "+err);
                   app.sendUpdate(client, "error", "INVALID_DEVICE");
               }else{
                   app.database.getDeviceSocketFromDevice(device.id, function(err, sockets){
                        if(err || !sockets[0]){
                            if(err)
                                app.error(`Error getting socket from device ID: device: ${device.id} error: ${err}`);
                            app.sendUpdate(client, "error", "DEVICE_NOT_CONNECTED");
                        }else
                            cb(sockets);
                   });
               }
            });
        }else{
            app.sendUpdate(client, "error", "INVALID_DEVICE");
        }
    }


    function remoteFunc(name){
        return function(client, req, message){
            validateRemote(client, message, function(sockets){
                message.device = null;
                sockets.forEach(function(socket){
                   app.sendUpdate(socket, name, message);
                });
            });
        }
    }

    return {
        name: "Remote Playback Handler",
        handlers: {
            "remotePlay":       remoteFunc("play"),
            "remoteSkip":       remoteFunc("skip"),
            "remoteSeek":       remoteFunc("seek"),
            "remoteVolume":     remoteFunc("volume"),
            "remoteQueue":      remoteFunc("queue"),
            "remoteQueueNext":  remoteFunc("queueNext"),
        }
    };
};



