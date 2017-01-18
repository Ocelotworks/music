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

        },
        updateAlbumImage: function updateAlbumImage(albumID, cb){

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
                    } else{
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
                                               } else{
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
                        app.log(artist.id);
                        object.updateArtistImage(artist.id, function(){
                            //Ignore error
                            asyncCB();
                        });
                    }, cb);
                }
            });
        }
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