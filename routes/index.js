var express = require('express');
var router = express.Router();
var config = require('config');



module.exports = function(app){


    const tabs = [
        "songs",
        "artists",
        "albums",
        "genres",
        "playlists",
        "radio",
        "add",
        "admin"
    ];


    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development', startTab: 0});
    });

    router.get('/:tab', function(req, res){
        var startTab = tabs.indexOf(req.params.tab);
        res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development', startTab: startTab > -1 ? startTab : 0});
    });

    const types = {
        playlist: "templates/songs/playlist/",
        radio: "",
        artist: "templates/songs/artist/",
        album: "templates/songs/album/"
    };

    router.get("/playlist/:id", function(req, res){
        res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development', loadPage: types["playlist"]+req.params.id});
    });

    router.put('/song/:id/vote/:direction', function(req, res){
        app.database.addSongVote(req.params.id, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a", req.params.direction == "up", function(err){
            if(err){
                res.header(500).json(err);
            }else
                res.header(204).json({});
        });
    });

    router.get("/song/:id", function(req, res){
       app.database.getSongPathToPlay(req.params.id, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a", function(err, resp){
           if(err){
               app.warn("Error getting song path: "+err);
               res.sendFile("/home/peter/doot/doot me up inside.mp3");
           }else{
               if(resp.length > 0){
                   var path = resp[0].path;
                   res.sendFile(path);
               }else{
                   app.warn("Received request for unknown song: "+req.param.id);
                   res.header(404).json({error: "Not Found"});
               }
           }
       });
    });

    router.get("/album/:id", function(req, res){
       app.database.getAlbumArt(req.params.id, function(err, resp){
           if(err || !resp[0] || !resp[0].image)
               res.redirect("../img/album.png");
           else{
               res.header('Content-Type', 'image/png');
               res.end(resp[0].image);
           }

       })
    });

    return router;
};

