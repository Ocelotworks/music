/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/playlist/:id', function(req, res){
        app.database.getPlaylistInfo(req.params.id, function(err, playlist) {
            if (err)
                app.renderError(err, res);
            else {
                if(!playlist || !req.user || req.user.id != playlist[0].owner){
                    res.header(404);
                }else{
                    playlist = playlist[0];
                    res.render('templates/modals/genericConfirmation', {
                        layout: false,
                        title: `Are you sure you want to delete '${playlist.name}'?`,
                        desc: "Deleted things tend to be gone forever! They cannot be brought back like dead people or bad memories can.",
                        controller: "PlaylistController",
                        yes: {
                            critical: true,
                            action: `deletePlaylistForReal('${req.params.id}')`
                        },
                        no: {
                            action: "$emit(\"closeModal\")"
                        }
                    });
                }
            }
        });
    });

    router.get('/playlist/:id/confirmed', function(req, res){
        if(req.user){
            res.header(401).send("You need to be logged in to do that.");
        }else{
            app.database.canUserEditPlaylist(req.params.id, req.user.id, function(err, bool){
                if(bool){
                    app.database.deletePlaylist(req.params.id, function(err){
                        if(err)
                            app.error("Error deleting playlist "+req.params.id+": "+err);
                        else
                            app.log("Playlist "+req.params.id+" deleted.");
                        res.header(204).send("");
                    });
                }else{
                    res.header(401).send("You need to be logged in to do that.");
                }
            });
        }
    });

    router.get('/downloadQueue/allFailed', function(req, res){
        app.database.clearFailedDownloads(function clearFailedDownloads(err){
           if(err) {
               app.error("Error clearing failed downloads: " + err);
           }
        });
        res.header(204).send("");
    });

    return router;
};