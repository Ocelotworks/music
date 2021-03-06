/**
 * Created by Peter on 11/12/2016.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/song/
module.exports = function(app){

    router.petifyInfo = {
        name: "Song API",
        route: "/api/song"
    };

    router.get('/', function(req, res){
      app.database.getSongList(-1, function(err, data) {
        if (err) {
          app.warn("Error processing song info request: "+err);
          res.status(500).json({err: err});
        } else {
          res.json(data);
        }
      });
    });

    /**
     * /song/:id/info
     */
    router.get('/:id/info', function(req, res){
        app.database.getSongInfo(req.params.id, function(err, data) {
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data[0]);
            }
        });
    });

    /**
     * /song/:id/details
     */
    router.get('/:id/details', function(req, res){
        app.database.getDetailedSongInfo(req.params.id, function(err, data){
            if (err) {
                app.warn("Error processing song detail request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data[0]);
            }
        });
    });

    /**
     * /api/song/play/:id/:manual
     * /api/song/:key/play/:id/:manual
     */
    router.put(['/play/:id/:manual', '/:key/play/:id/:manual'], app.util.validateKeyAbove(0), function(req, res){
        res.header(204).send("");
        app.database.addPlayForSong(req.params.id, req.user ? req.user.id :"c999f4ab-72a6-11e6-839f-00224dae0d2a",req.params.manual == "true", function addPlayForSongCB(err){
            if(err)app.error(`Error adding play for ${req.params.id} by user ${req.user.id}: ${err}`);
        });
    });

    /**
     * /api/song/skip/:id/:seconds
     * /api/song/:key/skip/:id/:seconds
     */
    router.put(['/skip/:id/:seconds', '/:key/skip/:id/:seconds'], app.util.validateKeyAbove(0), function(req, res){
        res.header(204).send("");
        app.database.addSkipForSong(req.params.id,  req.user ? req.user.id :"c999f4ab-72a6-11e6-839f-00224dae0d2a", parseFloat(req.params.seconds) || 0, function  addSkipForSongCB(err) {
            if(err)app.error(`Error adding skip for ${req.params.id} by user ${req.user.id}: ${err}`);
        })
    });

    /**
     * /song/:key/like/:songid
     * /song/:key/dislike/:songid
     */
    router.get('/:key/:direction/:songid', app.util.validateKeyAbove(0), function(req, res){
        app.database.getSongExists(req.params.id, function(err, exists){
            if(err){
                res.header(500).json({err: err});
            } else if(!exists){
                res.header(404).json({err: "Invalid song ID"});
            }else{
                app.database.addSongVote(req.params.id, user.id, req.params.direction === "like", function(err, res){
                    if(err){
                        res.header(500).json({err: err});
                    } else{
                        res.header(204);
                    }
                });
            }
        });
    });

    /**
     * /song/:key/:id/votes
     * /song/:id/votes
     */
    router.get(['/:key/:id/votes', '/:id/votes'], app.util.validateKeyAbove(0), function(req, res){
        app.database.getCurrentSongVote(req.params.id, req.user.id, function(err, result){
            if(err){
                console.log(err);
                res.header(500).json({err: err});
            }else{
                if(result.length > 0){
                    res.json({vote: result[0].up});
                }else{
                    res.header(404).json({err: "Not voted"});
                }
            }
        });
    });


    /**
     * /song/:key/:id/update
     * /song/:id/update
     */
    router.post(['/:key/:id/update', '/:id/update'], app.util.validateKeyAbove(0), function(req, res){
        if(req.body && req.body.album && req.body.artist && req.body.title){
            app.database.getOrCreateArtist(req.body.artist.trim(), function(err, artistID){
                if(err){
                    res.header(500).json({err: err});
                }else{
                    app.database.getOrCreateAlbum(req.body.album.trim(), artistID, function(err, albumID){
                       if(err){
                           res.header(500).json({err: err});
                       }else{
                           var updatedFields = {
                               title: req.body.title.trim(),
                               artist: artistID,
                               album: albumID
                           };

                           app.database.updateSong(req.params.id, updatedFields, function(err){
                              if(err){
                                  res.header(500).json({err: err});
                              }else{
                                  res.json(updatedFields);
                              }
                           });
                       }
                    });
                }
            });

        }
    });

    router.get('/artist/:id', function(req, res){
        app.database.getSongsByArtist(req.params.id, function(err, songs){
            if(err)
                res.header(500).json({err: err});
            else
                res.json(songs);
        });
    });

    router.get('/playlist/:id', function(req, res){
        app.database.getSongsByPlaylist(req.params.id, function(err, songs){
            if(err)
                res.header(500).json({err: err});
            else
                res.json(songs);
        });
    });

    router.get('/album/:id', function(req, res){
        app.database.getSongsByAlbum(req.params.id, function(err, songs){
            if(err)
                res.header(500).json({err: err});
            else
                res.json(songs);
        });
    });


    router.get('/genre/:id', function(req, res){
        app.database.getSongsByGenre(req.params.id, function(err, songs){
            if(err)
                res.header(500).json({err: err});
            else
                res.json(songs);
        });
    });

    return router;
};