/**
 * Created by Peter on 11/12/2016.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/artist/
module.exports = function(app){

    router.petifyInfo = {
        name: "Artist API",
        route: "/api/artist"
    };

    router.get("/", function(req, res){
        app.database.getAllArtists(function(err, data){
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data);
            }
        })
    });

    /**
     * /artist/:id/info
     */
    router.get('/:id/info', function(req, res){
        app.database.getArtistById(req.params.id, function(err, data) {
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data[0]);
            }
        });
    });


    router.get('/:key/:id/forceImageUpdate', app.util.validateKeyAbove(2), function(req, res){
        app.genreImageGenerator.updateArtistImage(req.params.id);
        res.header(204).send("");
    });


    router.get('/:id/forceImageUpdate', function(req, res){
        if(req.user && req.user.userlevel >= 2){
            app.genreImageGenerator.updateArtistImage(req.params.id);
            res.header(204).send("");
        }else{
            res.header(403).json({err: "Not authorised"});
        }
    });

    return router;
};