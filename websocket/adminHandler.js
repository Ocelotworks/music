/**
 * Created by Peter on 29/01/2017.
 */

var caller_id       = require('caller-id');
var dateFormat      = require('dateformat');

module.exports = function(app){

    var clientsReceivingLogs = [];

    var oldLogFunction = app.log;

    app.log = function log(message, caller){
        if(!caller)
            caller = caller_id.getData();
        var file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split("/");
        var log = `[${dateFormat(new Date(), "dd/mm/yy hh:MM")}] <b>[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}]</b> ${message}<br>`;
        for(var i in clientsReceivingLogs)
            if(clientsReceivingLogs.hasOwnProperty(i)){
                app.sendUpdate(clientsReceivingLogs[i], "log", log);
            }
        oldLogFunction(message, caller);
    };

    return {
      name: "Admin Function Handler",
      handlers: {
          "setReceiveLogs": function setReceiveLogsHandler(client, req, message){
              if(!req.user || req.user.userlevel < 2){
                  app.warn("User " + (req.user ? (req.user.id + " (" + req.user.username + ")") : "Guest")+ "tried to use admin function: " + message.message);
              }else{
                  if(client.id){
                      app.database.modifyDeviceSocket(client.id, {
                          receiveLogs: !!message.message
                      }, function(err){
                          if(err){
                              app.error(`Error setting ${client.id} to receive logs: ${err}`)
                          }
                      });
                  }

                  if(message.message){

                      if(clientsReceivingLogs.indexOf(client) === -1){
                          clientsReceivingLogs.push(client);
                          app.sendUpdate(client, "clearLogs");
                      }
                  }else{
                      clientsReceivingLogs.slice(clientsReceivingLogs.indexOf(client));
                  }
              }
          }
      }
    };
};