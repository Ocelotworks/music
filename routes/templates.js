var express = require('express');
var router = express.Router();




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

    router.get('/radio', function(req, res, next) {
        res.render('templates/radioList', {radios: [
            {
                addedBy: {
                    name: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Non-stop Pop",
                desc: "Just a fun loving dad on the internet",
                listeners: 420
            },
            {
                addedBy: {
                    name: "OcelotBOT",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Natasha Bedingfield",
                desc: "The rest is still unwritten",
                listeners: 0
            }
        ], layout: false});
    });

    router.get('/playlists', function(req, res, next) {
        res.render('templates/playlists', {publicPlaylists: [
            {
                addedBy: {
                    name: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Songs About Lidl",
                count: 69
            },
            {
                addedBy: {
                    name: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Songs About Time",
                count: 6900
            }
        ],
        privatePlaylists: [
            {
                addedBy: {
                    name: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Songs to Masturbate To",
                count: 69,
                private: true
            },
            {
                addedBy: {
                    name: "Peter Maguire",
                    avatar: "https://placekitten.com/64/64"
                },
                title: "Songs About Time",
                count: 6900
            }
        ],
            layout: false});
    });

    router.get('/add', function(req, res, next) {
        res.render('templates/add', {layout: false});
    });

    router.get('/add/playlist', function(req, res, next) {
        res.render('templates/addScreens/addPlaylist', {layout: false});
    });

    router.get('/add/song', function(req, res, next) {
        res.render('templates/addScreens/addSong', {folders: ["nsp", "edm", "beepityboop"], layout: false});
    });

    router.get('/add/radio', function(req, res, next) {
        res.render('templates/addScreens/addRadio', {layout: false});
    });

    return router;
};
