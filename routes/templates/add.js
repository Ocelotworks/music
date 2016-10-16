/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();
var config = require('config').get("Folders");

module.exports = function(app){


    router.get('/', function(req, res, next) {
        res.render('templates/add', {layout: false});
    });

    router.get('/playlist', function(req, res, next) {
        app.database.getSongList(function(err, songs){
            res.render('templates/addScreens/addPlaylist', {
                signedIn: req.user != null,
                songs: songs,
                layout: false
            });
        });
    });

    router.post('/playlist', function(req, res, next){
        var playlist = {};
        playlist.name = req.body.name;
        playlist.private = req.body.private == "on" || req.body.private == true;
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

    router.get('/song', function(req, res, next) {
        app.database.getSongQueue(function(err, queue){
            if(err)
                console.error("WARNING: Unable to retrieve song queue.");
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

    return router;
};