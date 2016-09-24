/*
* Copyright 2016 Ocelotworks
 */


var r = require('rethinkdb');


module.exports = function(app){
    console.log("Starting petify 1 import...");
    r.connect({
        host: 'localhost',
        db: '',
        user: '',
        password: ''
    }, function(err, conn){
        if(err){
            console.error("Error connecting to rethinkdb: "+err);
        }else{
            r.table("music").without("albumArt").run(rconn, function(err, cursor){
                if(err){
                    console.error("Error getting all songs: "+err);
                } else{
                    cursor.each(function(err, song){
                        if(err){
                            console.error("Error during cursor foreach: "+err);
                        }else{
                                app.database.getOrCreateAlbum(song.album ? song.album : "Unknown Album", function(err, albumID){
                                    app.database.getOrCreateArtist(song.artist ? song.artist : "Unknown Artist", function(err, artistID){
                                        app.database.addSong({
                                            artist: artistID,
                                            album: albumID,
                                            mbid: song.mbid,
                                            duration: song.duration,
                                            addedby: "e110a6dc-8254-11e6-839f-00224dae0d2a",
                                            genre: null,
                                            title: song.title
                                        }, function(err, res){
                                            if(err){
                                                console.error("ERROR ADDING SONG "+song.title+": "+err);
                                            }else{
                                                console.log("Added song "+song.title);
                                            }
                                        });
                                    });
                                });
                        }
                    });
                }
            });
        }
    });
};

