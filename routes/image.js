/*
 * Copyright 2016 Ocelotworks
 */


const express = require('express');
var router = express.Router();

//BASE+/image/
module.exports = function(app){

    router.get('/album/:id', function(req, res){
        app.database.getAlbumArt(req.params.id, function(err, resp){
            if(err || !resp[0] || !resp[0].image)
                res.redirect("../../img/album-christmas.png");
            else{
                res.header('Content-Type', 'image/png');
                res.end(resp[0].image);
            }
        });
    });

    router.get('/artist/:id', function(req, res){
        app.database.getArtistImage(req.params.id, function(err, resp){
            if(err || !resp[0] || !resp[0].image) {
                res.redirect("../../img/album-christmas.png");
            }else{
                res.header('Content-Type', 'image/png');
                res.end(resp[0].image);
            }
        });
    });

    return router;
};
