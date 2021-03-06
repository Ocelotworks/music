/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.petifyInfo = {
        name: "Modal Templates",
        route: "/templates/modals"
    };

    router.get('/songInfo/:id', function(req, res){
        app.database.getDetailedSongInfo(req.params.id, function(err, resp){
            if(err)
                app.renderError(err, res);
            else{
                app.database.getSongPlays(req.params.id, function(err, playsResp){
                    if(err)
                        app.renderError(err, res);
                    else
                        res.render('templates/modals/songInfo', {layout: false, info: resp[0], plays: playsResp[0].plays});
                });

            }

        });
    });

    router.get('/songInfo/:id/playlists', function(req, res){
        app.database.getPlaylistsBySong(req.params.id, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a", function(err, playlists){
            if(err){
                app.error("Error getting playlists from song: "+err);
                app.renderError(err, res);
            }else{
                res.render('templates/modals/songInfoTabs/playlists', {
                    layout: false,
                    playlists: playlists,
                    loggedIn: req.user != null
                });
            }
        });
    });

    router.get('/songInfo/:id/edit', function(req, res){
        if(!req.user){
            res.header(401).send("You must be logged in to do that.");
        }else{
            app.database.getDetailedSongInfo(req.params.id, function(err, resp){
                res.render('templates/modals/songInfoTabs/edit', {layout: false, song: resp[0]});
            });
        }
    });

    router.get('/songInfo/:id/technical', function(req, res){
        app.database.getSongInfo(req.params.id, function(err, resp){
            res.render('templates/modals/songInfoTabs/technical', {layout: false, song: resp[0]});
        });
    });

    router.get('/songInfo/:id/replace', function(req, res){
        res.render('templates/modals/songInfoTabs/replace', {layout: false});
    });

    router.get('/songInfo/:id/delete', function(req, res){
        res.render('templates/modals/genericConfirmation', {
            layout: false,
            title: `Are you sure you want to delete?`,
            desc: "Deleted things tend to be gone forever! They cannot be brought back like dead people or bad memories can.",
            yes: {
                name: "Delete Forever",
                critical: true,
                action: `deleteSong('${req.params.id}')`
            }
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


    router.get('/about', function(req, res){
       res.render('templates/modals/about', {layout: false});
    });

    router.get('/newDevice', function(req, res){
        res.render('templates/modals/newDevice', {layout: false});
    });

    router.get('/devices', function(req, res){
        if(req.user){
            app.database.getDevicesByUser(req.user.id, function(err, result){
                res.render('templates/modals/devices', {layout: false, devices: result});
            });
        }else{
            res.header(401).text("You need to be logged in to do that.");
        }
    });

    router.get("/accountHistory", function(req, res){
       if(req.user){
           app.database.getUserHistory(req.user.id, 0, function(err, result){
               if(err)
                   app.error("Error getting user history: "+err);
               res.render('templates/modals/accountHistory', {layout: false, history: result});
           });
       }else{
           res.header(401).text("You need to be logged in to do that.");
       }
    });

    return router;
};