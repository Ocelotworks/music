/*
* Copyright 2016 Ocelotworks
 */


var config = require('config');

module.exports = function(app){
    return {
        queue: function(url, destination, getLastmData){
            console.log("Received a song to queue");
            if(url && destination){

            }
        }
    }
};