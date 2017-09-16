/*
 * Copyright 2016 Ocelotworks
 */


const express = require('express');
var router = express.Router();

//BASE+/image/
module.exports = function(app){

    router.petifyInfo = {
        name: "Images",
        route: "/image"
    };

    router.get('/album/:id', function(req, res){
        app.database.getAlbumArt(req.params.id, function(err, resp){
            if(err || !resp[0] || !resp[0].image)
                res.redirect(app.christmasMode ? "../../img/album-christmas.png" : "../../img/album.png");
            else{
                res.header('Content-Type', 'image/png');
                res.end(resp[0].image);
            }
        });
    });

    router.get('/artist/:id', function(req, res){
        app.database.getArtistImage(req.params.id, function(err, resp){
            if(err || !resp[0] || !resp[0].image) {
                res.redirect(app.christmasMode ? "../../img/album-christmas.png" : "../../img/album.png");
            }else{
                res.header('Content-Type', 'image/png');
                res.end(resp[0].image);
            }
        });
    });

    return router;
};
