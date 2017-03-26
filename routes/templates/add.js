/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();
var config = require('config').get("Folders");
var path = require('path');
var uuid = require('uuid').v4;

module.exports = function(app){

    router.petifyInfo = {
        name: "Add Templates",
        route: "/templates/add"
    };

    router.get('/', function(req, res, next) {
        res.render('templates/add', {layout: false});
    });

    router.get('/playlist', function(req, res, next) {
        //app.database.getSongList(function(err, songs){
            res.render('templates/addScreens/addPlaylist', {
                signedIn: req.user != null,
                //songs: songs,
                layout: false
            });
        //});
    });

    router.post('/playlist', function(req, res, next){
        var playlist = {};
        playlist.name = req.body.name;
        playlist["private"] = req.body.private == "on" || req.body.private == true;
        playlist.addedby = req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a";
        playlist.songs = [];
        for(var k in req.body)
            if(req.body.hasOwnProperty(k) && k.indexOf("song-") > -1 && req.body[k])
                playlist.songs.push(k.split("song-")[1]);

        app.database.createPlaylist(playlist, function(err, resp){
            if(err){
                res.json({err: err});
            }else{
                res.json({});
            }
        });

    });

    router.post('/playlist/:playlist/addSong/:song', function(req, res){
       if(!req.user){
           res.header(401).send("You need to be logged in to do that.");
       } else{
           app.database.canUserEditPlaylist(req.params.playlist, req.user.id, function(err, canEdit){
               if(err){
                   app.renderError(err, res);
               }else{
                   if(!canEdit){
                       res.header(401).send("You need to be logged in to do that.");
                       app.warn(`User ${req.user.id} attempted to add song ${req.params.song} to playlist ${req.params.playlist} that they do not own.`);
                   }else{
                       app.database.addSongToPlaylist(req.params.playlist, req.params.song, function(err){
                            if(err)
                                app.error(`Error adding song ${req.params.song} to playlist ${req.params.playlist} for user ${req.user.id}: ${err}`);
                       });
                       res.header(204).send("");
                   }
               }
           });
       }
    });

    router.get('/song', function(req, res, next) {
        app.database.getSongQueue(function(err, queue){
            if(err)
                app.error("Unable to retrieve song queue: "+err);
            res.render('templates/addScreens/addSong', {folders: config.get("folders"), queue: queue, layout: false});
        });

    });

    router.post('/song', function(req, res){
        if(req.body && req.body.url && req.body.songFolder){
            app.downloader.queue(req.body.url, path.join(config.get("baseDir"), req.body.songFolder), req.body.getLastfmData || false, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a");
            res.json({});
        }else{
            res.json({err: "A required piece of data is missing."});
        }

    });

    router.get('/radio', function(req, res, next) {
        res.render('templates/addScreens/addRadio', {layout: false});
    });

    router.put('/play/:id', function(req, res){
        res.send("");
        app.database.addPlayForSong(req.params.id, req.user ? req.user.id :"c999f4ab-72a6-11e6-839f-00224dae0d2a" , function addPlayForSongCB(err){
            if(err)app.error("Error adding play for "+req.params.id+" by user "+req.user.id+": "+err);
        });
    });

    /** @namespace req.body.isMobile */
    /**
     * {
     *  deviceName: "", isMobile: false, userAgent: ""
     * }
     */
    router.post('/device', function(req, res){

        if(req.user){
            if(req.body && req.body.name && req.body.isMobile !== undefined && req.body.userAgent){
                var device = {
                    id: uuid(),
                    name: req.body.name,
                    userAgent: req.body.userAgent,
                    mobile: req.body.isMobile,
                    browser: req.body.browser,
                    os: req.body.os,
                    owner: req.user.id
                };
                app.database.addDevice(device, function createDeviceCB(err){
                   if(err){
                       app.error("Error adding device: "+err);
                       app.error(JSON.stringify(req.body));
                       res.header(500).json({err: "Internal Error."});
                   }else{
                       app.log(`Created new device for user ${req.user.username} (${req.user.id}): ${JSON.stringify(req.body)}`);
                       res.json({id: device.id});
                   }
                });
            }else{
                res.header(406).json({err: "Incomplete Data."});
            }
        }else{
            res.header(401).json({err: "You need to be logged in to do that."});
        }
    });

    return router;
};