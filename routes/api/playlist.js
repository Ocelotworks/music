/**
 * Created by Peter on 04/07/2017.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/playlist/
module.exports = function(app){

    router.petifyInfo = {
        name: "Playlist API",
        route: "/api/playlist"
    };

    /**
     * /api/playlist/:id
     * /api/playlist/:key/:id
     */
    router.get(['/:id', '/:key/:id/'], app.util.validateKeyAbove(0), function(req, res){
        app.database.getPlaylistInfo(req.params.id, function(err, playlist){
            if(err)
                app.renderError(err, res);
            else{
                if(!playlist || !playlist[0]){
                    res.json({err: 'The playlist you requested does not exist or is private.'});
                }else{
                    playlist = playlist[0];
                    if(!playlist.private  || (playlist.private && req.user && req.user.id === playlist.owner)){
                        app.database.getSongsByPlaylist(req.params.id, function(err, songs){
                            if(err)
                                res.json({err: err});
                            else {
                                res.json({info: playlist, songs: songs, isOwner: req.user && playlist.owner === req.user.id});
                            }
                        });
                    }else{
                        res.json({err: 'The playlist you requested does not exist or is private.'});
                    }
                }
            }
        });
    });

    router.delete(['/:id/:song', '/:key/:id/:song'], app.util.validateKeyAbove(0), function(req, res){
        app.database.canUserEditPlaylist(req.params.id, req.user.id, function(err, canEdit){
           if(err){
               res.json({err: err});
           }else if(!canEdit){
               res.json({err: "The playlist you requested does not exist or is private."});
           }else{
               app.database.removeSongFromPlaylist(req.params.id, req.params.song, function(err){
                    if(err){
                        res.json({err: err});
                    }else{
                        res.header(204);
                    }
               });
           }
        });

    });

    router.put(['/:id/:song/:position', '/:key/:id/:song/:position'], app.util.validateKeyAbove(0), function(req, res){

    });

    return router;
};