var express = require('express');
var router = express.Router();

var config = require('config').get("Folders");
var path = require('path');

module.exports = function(app){

    router.get('/radio', function(req, res, next) {
        res.render('templates/radioList', {radios: [
            {
                addedBy: {
                    username: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64",
                    userlevel: 2
                },
                title: "Non-stop Pop",
                desc: "Just a fun loving dad on the internet",
                listeners: 420
            },
            {
                addedBy: {
                    username: "System",
                    avatar: "https://placekitten.com/64/64",
                    userlevel: 100
                },
                title: "Natasha Bedingfield",
                desc: "The rest is still unwritten",
                listeners: 0
            }
        ], layout: false});
    });

    router.get('/artists', function(req, res){
       app.database.getAllArtists(function(err, result){
          if(err)
              app.renderError(err, res);
          else {
              res.render('templates/artists', {artists: result, layout: false});
          }
       });
    });

    router.get('/albums', function(req, res){
        app.database.getAllAlbums(function(err, result){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/albums', {albums: result, layout: false});

        });
    });

    router.get('/genres', function(req, res){
        app.database.getAllGenres(function(err, result){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/genres', {genres: result, layout: false});

        });
    });

    router.get('/playlists', function(req, res, next) {
        app.database.getPublicPlaylists(function(err, publicPlaylists){
            if(err)console.warn("Error getting public playlists: "+err);
           if(req.user)
                app.database.getPrivatePlaylists(req.user.id, function(err, privatePlaylists){
                    if(err)console.warn("Error getting private playlists: "+err);
                    res.render('templates/playlists', {
                        publicPlaylists: publicPlaylists || [],
                        privatePlaylists: privatePlaylists || [],
                        layout: false,
                        signedIn: true
                    });
                });
            else
                res.render('templates/playlists', {
                    publicPlaylists: publicPlaylists || [],
                    privatePlaylists: [],
                    signedIn: false,
                    layout: false
                });
        });

    });


    return router;
};

