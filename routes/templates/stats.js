/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();
const async = require('async');

module.exports = function(app){

    router.petifyInfo = {
        name: "Stats Templates",
        route: "/templates/stats"
    };

    router.get('/', function(req, res){
        async.mapValues({
            mostPlayed: app.database.getMostPlayedStats,
            mostPlayedTotal: app.database.getOverallStats,
            mostPlayedRecently: app.database.getMostPlayedRecentlyStats,
            mostSkipped: app.database.getMostSkippedStats
        }, function(databaseFunction, key, cb){
            databaseFunction(cb);
        }, function(err, result){
            if(err)app.warn("Error getting stats: "+err);
            res.render('templates/stats', {
                layout: false,
                stats: result
            });
        });
    });
    return router;
};