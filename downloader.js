/**
 * Created by Peter on 21/02/2017.
 */


const config = require('config');
const database = require('./modules/database.js');
const downloader = require('./modules/downloader.js');
const zmq = require('zmq');
const colours = require('colors');
const caller_id = require('caller-id');
var sock = zmq.socket('sub');
console.log("Listening on port "+config.get("IPC.port"));
sock.connect('tcp://127.0.0.1:'+config.get("IPC.port"));

sock.subscribe('downloader');
sock.subscribe('petify');


var app = {};

app.jobs = {addJob: function(){}};


/**
 * Log a message
 * @param {string} message
 * @param {object} [caller]
 */
app.log = function log(message, caller){
    console.log(message);
};

/**
 * Log an error
 * @param {string} message
 */
app.error = function error(message){
    app.log(message.red, caller_id.getData());
    app.errorCount++;
    if(app.database)
        app.database.logError("APP_ERROR", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app error: "+err);
        });
};

/**
 * Like an error, but less critical
 * @param {string} message
 */
app.warn = function warn(message){
    app.log(message.yellow, caller_id.getData());
    if(app.database)
        app.database.logError("APP_WARNING", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app warning: "+err);
        });
};

app.database = database(app);

app.downloader = downloader(app);

app.downloader.processOneSong();

sock.on("message", function(topic, message){
    if(topic == "petify"){
        console.log("Got petify message: "+message.toString());
    }else if(topic == "downloader"){
        var args = JSON.parse(message.toString());
        app.downloader.queue.apply(this, args);
    }else{
        console.log("Unknown topic: "+topic);
    }
});