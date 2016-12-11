/**
 * Created by Peter on 11/12/2016.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/song/
module.exports = function(app){
    /**
     * /song/:id/info
     */
    router.get('/:id/info', function(req, res){
        app.database.getSongById(req.params.id, function(err, data) {
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
    return router;
};