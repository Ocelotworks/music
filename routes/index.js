var express = require('express');
var router = express.Router();
var config = require('config');
var os = require('os');
var child_process = require('child_process');

module.exports = function(app){

    router.petifyInfo = {
        name: "Base",
        route: "/"
    };

    var tabs = [
        "home",
        "songs",
        "artists",
        "albums",
        "genres",
        "playlists",
        "radio",
        "add",
        "stats",
        "admin"
    ];

    if(config.get("General.christmasMode")){
        tabs.splice(4, 0, "christmas");
    }

    //TODO: TEMP
    app.nowPlayings = {};


    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development', startTab: 0});
    });

    router.get("/stats-collect", function(req, res){
        child_process.exec(" df | sed -n 8p | awk '{print $5}' | tr --delete %", function(err, stdout) {
            res.json({
                earth_cpu: os.loadavg()[0],
                earth_mem: os.freemem(),
                earth_storage: stdout | 0,
                petify_errors: app.errorCount,
                petify_requests: app.requestCount
            });
            app.errorCount = 0;
            app.requestCount = 0;
        });

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

    router.get(["/playlist/:id", "/playlist/:id/:name"], function(req, res){
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

    router.get('/play/:id', function(req, res){
        app.database.getDetailedSongInfo(req.params.id, function(err, result){
            if(err)app.error(err);
            res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development', startTab: 0, playSong: result[0]});
        });
    });

    router.get("/song/:id/:name", function(req, res){
        app.database.getDetailedSongInfo(req.params.id, function(err, data){
           if(err){
               app.renderError(err, res);
           } else{
               console.log(data[0]);
               res.render('shareSong', {layout: false, song: data[0]});
           }
        });
    });

    router.get("/song/:id", function(req, res){
        //TODO proper this
        if(req.headers['If-Modified-Since']){
            res.header(304).send("");
        }else{
            app.database.getSongPathToPlay(req.params.id, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a", function(err, resp){
                if(err){
                    app.warn("Error getting song path: "+err);
                    res.sendFile("/home/peter/doot/doot me up inside.mp3");
                }else{
                    if(resp.length > 0){
                        var path = resp[0].path;
                        res.header("Cache-Control", "public, max-age=999999");
                        res.sendFile(path);
                        if(req.user){
                            app.nowPlayings[req.user.id] = req.params.id;
                        }
                    }else{
                        app.warn("Received request for unknown song: "+req.param.id);
                        res.sendFile("/home/peter/doot/doot me up inside.mp3");
                    }
                }
            });
        }
    });

    //TO BE DEPRECATED
    router.get("/album/:id", function(req, res){
        if(req.headers['If-Modified-Since']){
            res.header(304).send("");
        }else
        app.database.getAlbumArt(req.params.id, function(err, resp){
           if(err || !resp[0] || !resp[0].image) {
               if(config.get("General.christmasMode"))
                   res.redirect("../img/album-christmas.png");
               else
                   res.redirect("../img/album.png");
           }else{
               res.header('Content-Type', 'image/png');
               res.header("Cache-Control", "public, max-age=60000");
               res.end(resp[0].image);
           }

        })
    });

    router.get("/genre/:id", function(req, res){
        if(req.headers['If-Modified-Since']){
            res.header(304).send("");
        }else
        app.database.getGenreArt(req.params.id, function(err, resp){
            if(err || !resp[0] || !resp[0].image)
                res.redirect("../img/album.png");
            else{
                res.header('Content-Type', 'image/png');
                res.header("Cache-Control", "public, max-age=60000");
                res.end(resp[0].image);
            }

        })
    });




    return router;
};

