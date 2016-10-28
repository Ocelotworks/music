/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/', function(req, res){
        app.database.getMostPlayedStats(function getMostPlayedStatsCB(err, mostPlayed){
            if(err)app.warn("Error getting stats: "+err);
            res.render('templates/stats', {
                layout: false,
                stats: {
                    mostPlayed: mostPlayed
                }
            });
        });
    });

    return router;
};