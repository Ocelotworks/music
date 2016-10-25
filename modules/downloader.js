/*
* Copyright 2016 Ocelotworks
 */


var config      = require('config');
var ytdl        = require('youtube-dl');
var ffmpeg      = require('fluent-ffmpeg');
var path        = require('path');
var uuid        = require('uuid').v4;
var ffprobe     = require('node-ffprobe');
var songRegex = /\(.*\)|lyrics|official/g;

module.exports = function(app){
    var object = {
        songsProcessing: 0,
        /**
         *  Process a single song from the queue
         */
        processOneSong: function processSong(){
            app.database.getQueuedSong(function getQueuedSong(err, info){
                if(err){
                    app.error("Error processing queued song: "+err);
                }else {
                    if (info && info[0] && info[0].id) {
                        var updateErrorHandler = function updateErrorHandler(err){
                            if(err){
                                app.error("Failed to update status of "+info.id+": "+err);
                            }else{
                                app.log("Successfully updated status of "+info.id)
                            }
                        };
                        info = info[0];
                        object.songsProcessing++;
                        app.database.updateQueuedSong(info.id, {
                            status: "PROCESSING"
                        }, function updateQueuedSong(err) {
                            if(err)app.warn("Error updating #"+info.id+" to PROCESSING: "+err);
                            var options = [];
                            var downloaderConfig = config.get("Downloader");
                            var proxy = downloaderConfig.get("proxy");
                            if (proxy)
                                options.push("--proxy=" + proxy);

                            if (downloaderConfig.get("forceIpv4"))
                                options.push("--force-ipv4");
                            var downloader = ytdl(info.url, options);
                            var songUUID = uuid();
                            downloader.on("info", function songInfoStart() {
                                ffmpeg()
                                    .input(downloader)
                                    .audioCodec(downloaderConfig.get("audioCodec"))
                                    .save(path.join(info.destination, songUUID + ".mp3"))
                                    .on('error', function songDownloadError(err) {
                                        app.error("Error downloading video: " + err);
                                        app.database.updateQueuedSong(info.id, {
                                            status: "FAILED"
                                        }, updateErrorHandler);
                                    })
                                    .on('end', function songDownloadEnd() {
                                        app.log("Finished downloading " + info.id);
                                        app.broadcastUpdate("alert", {
                                            lifetime: 5,
                                            title: "Download Finished",
                                            body: `${info.title} has downloaded successfully.`,
                                            image: "album/"+info.album
                                        });
                                        app.database.getOrCreateGenre(info.destination, function createGenre(err, genreID){
                                            if(err)app.warn("Error creating genre: "+err);
                                            var path = path.join(info.destination, songUUID + ".mp3");
                                            ffprobe(path, function ffprobe(err, data){
                                               if(err){
                                                   app.warn("Error probing file: "+path+": "+data);
                                               }
                                                app.database.addSong({
                                                    id: songUUID,
                                                    path: path,
                                                    artist: info.artist,
                                                    album: info.album,
                                                    addedby: info.addedby,
                                                    title: info.title,
                                                    duration: data.format.duration | 0,
                                                    genre: genreID
                                                }, function addSong(err) {
                                                    if (err) {
                                                        app.error("Error adding song to database: "+err);
                                                        app.database.updateQueuedSong(info.id, {
                                                            status: "FAILED"
                                                        }, updateErrorHandler);
                                                    } else {
                                                        app.database.removeQueuedSong(info.id, updateErrorHandler);
                                                    }
                                                    object.songsProcessing--;
                                                    object.processOneSong();
                                                });
                                            });
                                        });
                                    });
                            });
                        });
                    }
                }
            });
        },
        /**
         * Retrieve information about a song and then add it to the queue
         * @param url The URL of the song to download
         * @param destination The path of the song
         * @param getLastmData Boolean to retrieve data from last.fm or not
         * @param addedBy The UUID of the user that queued the song
         */
        queue: function queueSong(url, destination, getLastmData, addedBy){
            app.log("Received a song to queue "+url+" -> "+destination);
            if(url && destination){
                app.database.addSongToQueue(url, destination, addedBy, null, "Unknown", null, function addSongToQueue(err, result){
                    var id = result[0];
                    var options = ["--ignore-errors"];
                    var downloaderConfig = config.get("Downloader");
                    var proxy = downloaderConfig.get("proxy");
                    if(proxy)
                        options.push("--proxy="+proxy);

                    if(downloaderConfig.get("forceIpv4"))
                        options.push("--force-ipv4");

                    if(downloaderConfig.get("allowPlaylists")) {
                        options.push("--yes-playlist");
                        options.push("--flat-playlist");
                    } else
                        options.push("--no-playlist");

                    ytdl.getInfo(url, options, function getYTInfo(err, info){
                        app.log("Pre-processing song "+id);
                        if(info) {
                            if(info[0]){
                                app.database.removeQueuedSong(id, function removeSongFromQueue(err){
                                    if(err)app.error("Failed to remove queued song "+id+" from database: "+err);
                                   for(var i in info)
                                    if(info.hasOwnProperty(i))
                                        object.queue(info[i].url, destination, getLastmData, addedBy);
                                });
                            }else{
                                var titleSplit = info.fulltitle.replace(songRegex, "").split("-");
                                var artist = titleSplit[0];
                                var title = titleSplit[1];
                                if(titleSplit.length < 2){
                                    title = titleSplit[0];
                                    artist = info.uploader;
                                }
                                if (info.creator)
                                    artist = info.creator;

                                if (info.alt_title)
                                    title = info.alt_title;

                                app.database.getOrCreateArtist(artist.replace(" Listen ad-free with YouTube Red", ""), function createArtist(err, artistId){
                                    if(!err){
                                        app.database.updateQueuedSong(id, {
                                            artist: artistId,
                                            title: title
                                        }, function(err, res){
                                            if(err){
                                                app.error("Error updating queued song: "+err);
                                            }else{
                                                app.log("Success!");
                                            }
                                            if(object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")){
                                                object.processOneSong();
                                            }
                                        });
                                    }else{
                                        app.warn("Error creating artist "+artist+": "+err);
                                    }
                                });
                            }
                        }else{
                            app.error("Error getting info from #"+id+": "+err);
                            app.database.updateQueuedSong(id, {
                                status: "FAILED"
                            },function updateQueuedSong(err){
                                if(err)
                                    app.error("Failed to set "+id+" status to failed");
                            });
                        }

                    });
                });
            }
        },
        findAlbumArt: function(){

        },
        findArtistImage: function(){

        }
    };

    return object;
};