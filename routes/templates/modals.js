/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/songInfo/:id', function(req, res){
        app.database.getDetailedSongInfo(req.params.id, function(err, resp){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/modals/songInfo', {layout: false, info: resp[0]})
        });

    });

    router.get('/addToPlaylist/:song', function(req, res){
        if(!req.user){
           res.header(401).send("You need to be logged in to do that.")
        }else{
            app.database.getSongInfo(req.params.song, function(err, song){
                if(err){
                    app.renderError(err, res);
                }else{
                    app.database.getOwnedPlaylists(req.user.id, function(err, playlists){
                        if(err){
                            app.renderError(err, res);
                        }else{
                            res.render('templates/modals/addToPlaylist', {
     /*It's free real*/         layout: false,
     /*    estate    */         playlists: playlists,
                                song: song[0]
                            });
                        }
                    });
                }
            });
        }
    });
    return router;
};