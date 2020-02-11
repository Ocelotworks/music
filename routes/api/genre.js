/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 30/08/2019
 * ╚════ ║   (music) genre
 *  ════╝
 */
var express = require('express');
var router = express.Router();

module.exports = function(app){


    router.petifyInfo = {
        name: "Album API",
        route: "/api/genre"
    };


    router.get("/", function(req, res){
        app.database.getAllGenres(function(err, data){
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data);
            }
        })
    });


    return router;
};