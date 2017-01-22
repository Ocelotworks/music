/*
* Copyright Ocelotworks 2016
 */


var express = require('express');
var router = express.Router();

// BASE+/api/
module.exports = function(app){

    router.get('/status', function(req, res){
       res.json({errorCount: app.errorCount, requestCount: app.requestCount, uptime: process.uptime()});
    });


    router.get('/:key/nowPlaying/:user', app.util.validateKeyAbove(2), function(req, res){
        if(app.nowPlayings[req.params.user]){
            app.database.getDetailedSongInfo(app.nowPlayings[req.params.user], function(err, result){
               if(err){
                   res.header.json({err: err});
               }else{
                   res.json(result[0]);
               }
            });
        }else{
            res.json({err: "The user is not playing anything."});
        }
    });


    return router;
};