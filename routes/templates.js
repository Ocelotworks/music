var express = require('express');
var router = express.Router();

var config = require('config').get("Folders");
var path = require('path');

module.exports = function(app){

    router.get('/songs', function(req, res, next) {
        app.database.getSongList(function(err, songs){
            if(err){
                app.renderError(err, res);
            }else{
                res.render('templates/songList', {songs: songs, layout: false});
            }
        });
    });

    router.get('/songs/artist/:id', function(req, res){
        app.database.getSongsByArtist(req.params.id, function(err, songs){
            if(err)
                app.renderError(err, res);
            else
                res.render('templates/songList', {songs: songs, layout: false});
        });
    });

    router.get('/songs/album/:id', function(req, res){
       app.database.getSongsByAlbum(req.params.id, function(err, songs){
            if(err)
                app.renderError(err, res);
           else
                res.render('templates/songList', {songs: songs, layout: false});
       });
    });



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

    router.get('/add', function(req, res, next) {
        res.render('templates/add', {layout: false});
    });

    router.get('/add/playlist', function(req, res, next) {
        app.database.getSongList(function(err, songs){
            res.render('templates/addScreens/addPlaylist', {
                signedIn: req.user != null,
                songs: songs,
                layout: false
            });
        });
    });

    router.post('/add/playlist', function(req, res, next){
       var playlist = {};
        playlist.name = req.body.name;
        playlist.private = req.body.private;
        playlist.addedby = req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a";
        playlist.songs = [];
        for(var k in req.body)
            if(req.body.hasOwnProperty(k) && k.indexOf("song-") > -1 && req.body[k])
                playlist.songs.push(k.split("song-")[1]);

        app.database.createPlaylist(playlist, function(err, resp){
            if(err){
                res.json({err: err});
            }else{
                res.json({});
            }
        });

    });

    router.get('/add/song', function(req, res, next) {
        app.database.getSongQueue(function(err, queue){
            if(err)
                console.error("WARNING: Unable to retrieve song queue.");
            res.render('templates/addScreens/addSong', {folders: config.get("folders"), queue: queue, layout: false});
        });

    });

    router.post('/add/song', function(req, res){
        if(req.body && req.body.url && req.body.songFolder){
            app.downloader.queue(req.body.url, path.join(config.get("baseDir"), req.body.songFolder), req.body.getLastfmData || false, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a");
            res.json({});
        }else{
            res.json({err: "A required piece of data is missing."});
        }

    });

    router.get('/add/radio', function(req, res, next) {
        res.render('templates/addScreens/addRadio', {layout: false});
    });

    return router;
};

