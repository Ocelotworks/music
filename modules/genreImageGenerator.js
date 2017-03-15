/*
* Copyright Ocelotworks 2016
 */


var gm      = require('gm');
var fs      = require('fs');
var async   = require('async');
var config  = require('config');
var path    = require('path');
var request = require('request');

//yes, mega is bigger than extralarge but extralarge is most preferred
const imageSizes = ["small", "medium", "large", "mega", "extralarge"];

module.exports = function(app){
    var object =  {
        /**
         * Creates a 300x300 square of 4 images from 4 random albums with songs with the specified genre on
         * @param genre The genre UUID
         */
        generateImageForGenre: function generateImageForGenre(genre) {
            if (!fs.existsSync(config.get("General.tempDir"))) {
                fs.mkdirSync(config.get("General.tempDir"));
            }
            app.database.getAlbumArtForGenreImage(genre, function getAlbumArtForGenreImage(err, data) {
                if (err) {
                    app.error("Error getting album art for genre " + genre);
                } else {
                    if (data.length < 4) {
                        app.warn("Not enough albums to create genre image for " + genre);
                        if(data.length >= 1){
                            app.database.putGenreImage(genre, data[0].image, function(err){
                                app.log("Created one anyway");
                            });
                        }
                    } else {
                        app.log("Creating genre image for "+genre);
                        var imagePaths = [];
                        async.each(data, function writeTempImages(imageBlob, cb) {
                            var imagePath = path.join(config.get("General.tempDir"), "image-" + genre + "-" + parseInt(Math.random() * 1000) + ".png");
                            imagePaths.push(imagePath);
                            fs.writeFile(imagePath, imageBlob.image, cb);
                        }, function (err) {
                            if (err) {
                                app.error("Error saving album art in temp dir: " + err);
                            } else {
                                if (imagePaths.length == 4) {
                                    gm()
                                        .in("-page", "+0,0")
                                        .in(imagePaths[0])
                                        .in("-page", "+300+0")
                                        .in(imagePaths[1])
                                        .in("-page", "+0+300")
                                        .in(imagePaths[2])
                                        .in("-page", "+300+300")
                                        .in(imagePaths[3])
                                        .minify()
                                        .mosaic()
                                        .toBuffer('PNG', function createImageBuffer(err, buffer) {
                                            if (err) {
                                                app.error("Error creating genre image buffer: " + err);
                                            } else {
                                                app.database.putGenreImage(genre, buffer, function putGenreImage(err) {
                                                    if (err) {
                                                        app.error("Error putting genre image in database: " + err);
                                                    } else {
                                                        app.log("Updated genre image for " + genre);
                                                        for(var i in imagePaths) {
                                                            if (imagePaths.hasOwnProperty(i)) {
                                                                fs.unlink(imagePaths[i], function deleteTempImages(err) {
                                                                    if (err)
                                                                        app.warn("Error deleting " + imagePaths[i] + ": " + err)
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                } else {
                                    app.warn("Not enough songs to create a mosaic for genre " + genre);
                                }
                            }
                        });
                    }
                }
            });
        },
        lastfmImageArrayToMysqlData: function lastfmImageArrayToMysqlData(arr, cb){
            var biggestImageUrl;
            var biggestImageSize = -1;
            async.forEach(arr, function(image, cb){
                const imageSize = imageSizes.indexOf(image.size);
                if(image.size && image["#text"] && imageSize > biggestImageSize){
                    biggestImageSize = imageSize;
                    biggestImageUrl = image["#text"];
                }
                cb();
            }, function(){
                request({url: biggestImageUrl, encoding: null}, function(err, resp, imageData){
                    if(err || resp.statusCode >= 400){
                        cb(err ||  resp.statusCode, null);
                    }else{
                        cb(null, imageData);
                    }
                });
            });
        },
        getImageFromAlbumName: function getImageFromAlbumName(albumName, cb){

        },
        updateSongFromLastfmData: function(songID, cb){
            app.database.getDetailedSongInfo(songID, function getSongInfoCB(err, result){
                if(err){
                    app.log(`Error getting song info for ${songID}: ${err}`);
                    if(cb)cb();
                }else{
                    var song = result[0];
                    if(song && song.artist_name){
                        request(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${config.get("Keys.lastfm")}&artist=${song.artist_name}&track=${song.title}&format=json`, function lastfmGetAlbumSearchCB(err, response, body){
                            if(err){
                                app.log(`Error getting info from lastFM: ${err}`);
                                if(cb)cb();
                            }else{
                                if(cb)cb();
                                body = JSON.parse(body).track;
                                if(body && body.album && body.album.title){
                                    app.log("Got new album");
                                    app.database.getOrCreateAlbum(body.album.title, song.artist_id, function(err, albumID){
                                        if(err){
                                            app.log(`Error creating album ${body.album.title}: ${err}`);
                                            if(cb)cb();
                                        } else{
                                            app.log(`Updated album ${body.album.title} by ${song.artist_name} (${albumID})`);
                                            if(body.album.image){
                                                object.lastfmImageArrayToMysqlData(body.album.image, function(err, imageData){
                                                    if(err){
                                                        app.log(`Error getting lastfm image for ${body.album.title}: ${err}`);
                                                    }else{
                                                        app.database.updateAlbumArt(albumID, imageData, function (err) {
                                                            if (err) {
                                                                app.error(`Error updating album art for ${albumID}: ${err}`);
                                                            } else {
                                                                app.log(`Updated album art for ${albumID}`);
                                                            }//if err
                                                        });//updateAlbumArt
                                                    }// if err
                                                }); //lastfmImageArrayToMysqlData
                                            }else{
                                                app.log(`No image for album ${body.album.title}`);
                                            }//if body.album.image
                                            app.database.updateSong(songID, {album: albumID}, function(err){
                                                if(err)
                                                    app.log(`Error updating song for album ${songID}: ${err}`);
                                            });
                                        }// if err
                                    });//getOrCreateAlbum
                                }//if body.album
                                if(body && body.toptags && body.toptags.tag.length > 0){
                                    app.log("Got new genre");
                                    var genre = body.toptags.tag[0].name;
                                    app.database.getOrCreateGenre(genre, function(err, genreID){
                                        if(err){
                                            app.log(`Error creating genre ${genre}: ${err}`);
                                        }else{
                                            app.log("Created genre "+genreID);
                                            app.database.updateSong(songID, {genre: genreID}, function(err){
                                                if(err)
                                                    app.log(`Error updating song for genre ${songID}: ${err}`);
                                                else{
                                                    app.log(`Changed ${songID}/${song.title} genre to ${genre}`);
                                                }
                                            }); //updateSong
                                        }// if err
                                    });//getOrCreateGenre
                                } //if body.toptags
                            }//if err
                        }); //request
                    }//if song.artist_name
                }//if err
            }); //getSongInfo
        },
        updateAlbumImage: function updateAlbumImage(albumID, cb){
            app.database.getAlbumInfo(albumID, function getAlbumInfoCB(err, result){
               if(err){
                   app.warn(`Error getting album info for ${albumID}: ${err}`);
                   if(cb)cb(err);
               } else{
                   var album = result[0];
                   if(album){
                       app.log(JSON.stringify(album));
                       request(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${album.albumName}&api_key=${config.get("Keys.lastfm")}&format=json`, function lastfmGetAlbumSearchCB(err, response){
                           if(err){
                               app.error(`Error getting album search page for album ${album.albumName}/${albumID}: ${err}`);
                               if(cb)cb(err);
                           }else{
                               response = JSON.parse(response.body);
                               if(!response.results){
                                   app.error(`No results found for album ${album.albumName}/${albumID}`);
                                   if(cb)cb();
                               }else{
                                   app.log(`Results found for album ${album.albumName}/${albumID}`);
                                   var albumMatches = response.results.albummatches.album;
                                   async.eachSeries(albumMatches, function(albumMatch, eachCb) {
                                       app.log("Trying album art...");
                                       if (albumMatch.artist.toLowerCase() == album.artistName.toLowerCase()) {
                                           app.log("Matched album "+JSON.stringify(albumMatch));
                                           object.lastfmImageArrayToMysqlData(albumMatch.image, function (err, imageData) {
                                               if (err) {
                                                   app.error(`Error turning lastfm image array into data: ${err}`);
                                                   eachCb();
                                               } else {
                                                   app.log("Transferring album art to database...");
                                                   app.database.updateAlbumArt(albumID, imageData, function (err) {
                                                       if (err) {
                                                           app.error(`Error updating album art for ${albumID}: ${err}`);
                                                           eachCb();
                                                       } else {
                                                           app.log(`Updated album art for ${album.albumName}/${albumID}`);
                                                           eachCb(true);
                                                       }//if err
                                                   });//updateAlbumArt
                                               }//if err
                                           });//lastfmImageArrayToMysqlData
                                       } else {
                                           app.log(`Artist ${albumMatch.artist.toLowerCase()} doesn't match ${album.artistName.toLowerCase()}`);
                                           eachCb();
                                       }//if artist = artistName

                                   }, function finishIteration(foundMatch){
                                       if(!foundMatch){
                                           app.warn(`Failed to find album art for ${album.albumName}/${albumID}`);
                                       }else{
                                           app.log("On to the next album...");
                                       }
                                       if(cb)cb();
                                   }); //each albumMatches
                               }// !response.results
                           }// err
                       });//request
                   }else{
                       app.error(`Invalid Album ID ${albumID}`);
                   }//album
               }//err
            });//getAlbumInfo
        },
        updateArtistImage: function updateArtistImage(artistID, cb){
            if(!config.has("Keys.lastfm")){
                app.warn("Tried to get artist image but lastFM key missing.");
                if(cb)cb("No Key");
            }else{
                app.database.getArtistName(artistID, function getArtistNameCB(err, result){
                    if(err){
                        app.error("Error getting artist info: "+err);
                        if(cb)cb(err);
                    }else{
                        if(result[0]){
                            var artistName = result[0].name;
                            app.log("Getting Image for "+artistName);
                            request(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artistName}&api_key=${config.get("Keys.lastfm")}&autocorrect=1&format=json`, function lastfmGetArtistInfoCB(err, resp, body){
                                if(err || resp.statusCode >= 400){
                                    app.error("Error getting response from lastfm: "+(err ? err : "HTTP "+resp.statusCode));
                                    if(cb)cb(err ? err : resp.statusCode);
                                }else{
                                    try{
                                        var data = JSON.parse(body);
                                        if(data.error){
                                            app.error("Error getting artist image: "+data.message);
                                            if(cb)cb(data.message);
                                        }else if(data.artist && data.artist.image && data.artist.image.length > 0){
                                            object.lastfmImageArrayToMysqlData(data.artist.image, function lastfmImageArrayToMysqlDataCB(err, imageData){
                                               if(err){
                                                   app.error("Error getting image data: "+err);
                                                   if(cb)cb(err);
                                               }else{
                                                   app.database.updateArtistImage(artistID, imageData, function updateArtistImageCB(err){
                                                      if(err) {
                                                          app.error("Error adding image data to database: " + err);
                                                          if(cb)cb(err);
                                                      }else{
                                                        app.log("Successfully updated image for "+artistName);
                                                        if(cb)cb(null);
                                                      }
                                                   });
                                               }
                                            });
                                        }else{
                                            app.warn("Artist "+artistName+" has no images.");
                                        }
                                    }catch(e){
                                        app.error("Error parsing lastfm response: "+e);
                                        if(cb)cb(e);
                                    }
                                }
                            });
                        }else{
                            app.warn("Tried to get artist image but artist doesn't exist. ("+artistID+")");
                            if(cb)cb("No Artist");
                        }
                    }
                });
            }
        }
    };


    app.jobs.addJob("Update All Missing Artist Images", {
        desc: "Updates all artists with no artist image",
        args: [],
        func: function(cb){
            app.database.getArtistsWithNoImage(function(err, res){
                if(err)cb(err);
                else{
                    async.eachSeries(res, function(artist, asyncCB){
                        object.updateArtistImage(artist.id, function(){
                            app.log("Updated artist image for "+artist.id);
                            asyncCB();
                        });
                    }, cb);
                }
            });
        }
    });

    app.jobs.addJob("Update All Missing Album Images", {
        desc: "Updates all albums with no album art",
        args: [],
        func: function(cb){
            app.database.getAlbumsWithNoImage(function(err, res){
               if(err && cb)cb(err);
               else{
                   async.eachSeries(res, function(album, asyncCB){
                       object.updateAlbumImage(album.id, function(){
                           app.log("Updated album image for "+album.id);
                          asyncCB();
                       });
                   }, function(){
                       app.log("Finished.");
                   });
               }
            });
        }
    });

    app.jobs.addJob("Update Unknown Albums", {
        desc: "Updates all songs with unknown albums",
        args: [],
        func: function(cb){
            app.database.getSongsWithUnknownAlbum(function(err, res){
                if(err && cb)cb(err);
                else{
                    async.eachSeries(res, function(song, asyncCB){
                        object.updateSongFromLastfmData(song.id, function(){
                            app.log("Processed "+song.id);
                            asyncCB();
                        });
                    }, function(){
                        app.log("Finished. Running Album cleanup");
                        app.database.cleanupAlbums(function cleanupAlbumsCB(){
                            app.log("Finished cleaning up albums");
                        });
                    });
                }
            });
        }
    });

    app.jobs.addJob("Update Genre Images", {
        desc: "Updates all genres with no genre image",
        args: [],
        func: function(cb){
            app.database.getGenresWithNoImage(function(err, res){
                if(err && cb)cb(err);
                else{
                    async.eachSeries(res, function(genre, asyncCB){
                        object.generateImageForGenre(genre.id);
                        asyncCB();
                    }, function(){
                        app.log("Finished.");
                    });
                }
            });
        }
    });

    app.jobs.addJob("Update Album Image", {
        desc: "Update/add an image for a specific album ID",
        args: ["Album ID"],
        func: object.updateAlbumImage
    });

    app.jobs.addJob("Update Artist Image", {
        desc: "Update/add an image for a specific artist ID",
        args: ["Artist ID"],
        func: object.updateArtistImage
    });

    app.jobs.addJob("Update Genre Image", {
        desc: "Update/add an image for a specific genre ID",
        args: ["Genre ID"],
        func: object.generateImageForGenre
    });

    return object;
};