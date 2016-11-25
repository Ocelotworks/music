/*
* Copyright Ocelotworks 2016
 */


var express = require('express');
var router = express.Router();


module.exports = function(app){


    function needsApiKey(req, res, next){
        if(!req.params.key){
            res.json({err: "API Key Required"});
        }else{
            next();
        }
    }

    router.get('/song/:id/info', function(req, res){
        app.database.getSongById(req.params.id, function(err, data) {
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data[0]);
            }
        });
    });


    router.get('/song/:id/details', function(req, res){
       app.database.getDetailedSongInfo(req.params.id, function(err, data){
           if (err) {
               app.warn("Error processing song detail request: "+err);
               res.status(500).json({err: err});
           } else {
               res.json(data[0]);
           }
       });
    });


    router.get('/status', function(req, res){
       res.json({errorCount: app.errorCount, requestCount: app.requestCount});
    });


    router.get('/:key/nowPlaying/:user', function(req, res){
        app.database.getUserFromApiKey(req.params.key, function(err, result){
           if(err){
               res.json({err: err});
           } else{
               var user = result[0];
               if(user.userlevel < 2){
                   res.json({err: "Invalid access level"});
               }else{
                    if(app.nowPlayings[req.params.user]){
                        app.database.getDetailedSongInfo(app.nowPlayings[req.params.user], function(err, result){
                           if(err){
                               res.json({err: err});
                           }else{
                               res.json(result[0]);
                           }
                        });
                    }else{
                        res.json({err: "The user is not playing anything."});
                    }
               }
           }
        });
    });

    return router;
};