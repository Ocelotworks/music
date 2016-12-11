/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/', function(req, res, next) {
        app.database.getSongList(function(err, songs){
            if(err){
                app.renderError(err, res);
            }else{
                res.render('templates/songList', {songs: songs, layout: false});
            }
        });
    });

    router.get('/artist/:id', function(req, res){
        app.database.getSongsByArtist(req.params.id, function(err, songs){
            if(err)
                app.renderError(err, res);
            else{
                app.database.getArtistName(req.params.id, function(err, response){
                    if(err){
                        app.warn("Error getting artist info: "+err);
                        res.render('templates/songList', {songs: songs, layout: false});
                    }else{
                        res.render('templates/artistSongList', {songs: songs, artist: response[0], artistID: req.params.id, layout: false});
                    }
                });

            }

        });
    });

    router.get('/album/:id', function(req, res){
        app.database.getSongsByAlbum(req.params.id, function(err, songs){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/songList', {songs: songs, layout: false});
        });
    });

    router.get('/genre/:id', function(req, res){
        app.database.getSongsByGenre(req.params.id, function(err, songs){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/songList', {songs: songs, layout: false});
        });
    });

    router.get('/playlist/:id', function(req, res){
        app.database.getPlaylistInfo(req.params.id, function(err, playlist){
            if(err)
                app.renderError(err, res);
            else{
                if(!playlist || !playlist[0]){
                    res.send('The playlist you requested does not exist or is private.');
                }else{
                    playlist = playlist[0];
                    if(!playlist.private  || (playlist.private && req.user && req.user.id == playlist.owner)){
                        app.database.getSongsByPlaylist(req.params.id, function(err, songs){
                            if(err)
                                app.renderError(err, res);
                            else {
                                res.render('templates/playlist', {songs: songs, info: playlist, isOwner: req.user && playlist.owner == req.user.id, layout: false});
                            }
                        });
                    }else{
                        res.send('The playlist you requested does not exist or is private.');
                    }
                }
            }
        });
    });

    router.get('/shuffleQueue', function(req, res){
        app.database.getShuffleQueue(req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a", function(err, data){
           if(err){
               res.header(500).json({err: err});
           } else {
               res.json(data);
           }
        });
    });

    return router;
};