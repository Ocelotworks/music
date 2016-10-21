/*
* Copyright Ocelotworks 2016
 */


var gm      = require('gm');
var fs      = require('fs');
var async   = require('async');
var config  = require('config');
var path    = require('path');

module.exports = function(app){
    return {
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
        }
    };
};