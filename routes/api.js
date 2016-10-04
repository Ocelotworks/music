/*
* Copyright Ocelotworks 2016
 */


var express = require('express');
var router = express.Router();


module.exports = function(app){

    router.get('/song/:id/info', function(req, res){
        app.database.getSongById(req.params.id, function(err, data) {
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data[0]);
            }
        });
    });


    router.get('/song/:id/details', function(req, res){
       app.database.getDetailedSongInfo(req.params.id, function(err, data){
           if (err) {
               app.warn("Error processing song detail request: "+err);
               res.status(500).json({err: err});
           } else {
               res.json(data[0]);
           }
       });
    });

    return router;
};