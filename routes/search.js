/*
* Copyright 2016 Ocelotworks
 */


const express = require('express');
const async = require('async');
var router = express.Router();

module.exports = function(app){

    router.get('/query/:query', function(req, res){
        async.mapValues({
            songs: app.database.searchSongs,
            albums: app.database.searchAlbums,
            artists: app.database.searchArtists,
            genres: app.database.searchGenres
        }, function(searchFunction, key, cb){
            searchFunction(req.params.query, cb);
        }, function(err, result){
            if(err)app.warn("Error searching: "+err);
            res.json(result);
        });
    });

    router.get('/artist/:query', function(req, res){
        app.database.searchArtists(req.params.query, function(err, resp){
            if(err){
                app.warn("Received invalid search query "+req.params.query);
                app.warn("Producing error: "+err);
                res.status(500).json({err: err});
            } else{
                res.send(resp);
            }
        });
    });

    router.get('/album/:query', function(req, res){
        app.database.searchAlbums(req.params.query, function(err, resp){
            if(err){
                app.warn("Received invalid search query "+req.params.query);
                app.warn("Producing error: "+err);
                res.status(500).json({err: err});
            } else{
                res.send(resp);
            }
        });
    });


    router.get('/template/:query', function searchTemplate(req, res){
        async.mapValues({
            songs: app.database.searchSongs,
            albums: app.database.searchAlbums,
            artists: app.database.searchArtists,
            genres: app.database.searchGenres
        }, function(searchFunction, key, cb){
            searchFunction(req.params.query, cb);
        }, function(err, result){
            if(err)app.warn("Error searching: "+err);
            result.layout = false;
            res.render('templates/searchResult', result);
        });
        // app.database.search(req.params.query, function(err, resp){
        //     if(err){
        //         app.renderError(err, res);
        //     } else{
        //         res.render('templates/songList', {
        //             songs: resp,
        //             layout: false
        //         });
        //     }
        // });
    });

  return router;
};
