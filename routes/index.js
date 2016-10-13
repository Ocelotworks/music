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


    router.get("/song/:id", function(req, res){
       app.database.getSongPath(req.params.id, function(err, resp){
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

