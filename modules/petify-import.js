/*
* Copyright 2016 Ocelotworks
 */


var r = require('rethinkdb');
var uuid = require('uuid').v4;

module.exports = function(app){
    console.log("Starting petify 1 import...");
    r.connect({
        host: 'localhost',
        db: '',
        user: '',
        password: ''
    }, function(err, rconn){
        if(err){
            console.error("Error connecting to rethinkdb: "+err);
        }else{
            console.log("Getting all the albums... This will take a while");
            r.table("music").pluck("album", "albumArt").distinct().run(rconn, function(err, cursor){
                if(err){
                    console.error("Error getting all songs: "+err);
                } else{
                    cursor.eachAsync(function(song, cb){
                        if(err){
                            console.error("Error during cursor foreach: "+err);
                        }else{

                            app.database.getOrCreateAlbum(song.album, function(err, albumID){
                               app.database.updateAlbumArt(albumID, song.albumArt, function(err, res){
                                   console.log("Done "+song.album);
                                  cb();
                               });
                            });

                            //app.database.getOrCreateAlbum(song.album ? song.album.trim() : "Unknown Album", function(err, albumID){
                            //    app.database.getOrCreateArtist(song.artist ? song.artist.trim() : "Unknown Artist", function(err, artistID){
                            //        app.database.getOrCreateGenre(song.catagories[0] ? song.catagories[0] : "Unknown", function(err, genreID){
                            //            app.database.addSong({
                            //                id: uuid(),
                            //                artist: artistID,
                            //                album: albumID,
                            //                mbid: song.mbid,
                            //                duration: song.duration,
                            //                addedby: "e110a6dc-8254-11e6-839f-00224dae0d2a",
                            //                path: song.path,
                            //                genre: genreID,
                            //                title: song.title
                            //            }, function(err, res){
                            //                if(err){
                            //                    console.error("ERROR ADDING SONG "+song.title+": "+err);
                            //                    cb();
                            //                }else{
                            //                    console.log("Added song "+song.title);
                            //                    cb();
                            //                }
                            //            });
                            //        });
                            //    });
                            //});
                        }
                    });
                }
            });
        }
    });
};

