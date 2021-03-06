/*
* Copyright 2016 Ocelotworks
 */


var config      = require('config');
var ytdl        = require('youtube-dl');
var ffmpeg      = require('fluent-ffmpeg');
var path        = require('path');
var uuid        = require('uuid').v4;
var ffprobe     = require('node-ffprobe');
var spawn       = require('child_process').spawn;
var async       = require('async');
var md5file     = require('md5-file');
var songRegex = /[{\[\('"].*["'\]\)}]|"|lyrics|official|(music )?video|hd|.*\|\|/ig;

var downloaderConfig = config.get("Downloader");
var proxy = downloaderConfig.get("proxy");

module.exports = function(app){

    app.database.resetSongQueue(function resetSongQueueCB(err){
        if(err){
            app.error("Could not reset song queue: "+err);
        }else{
            app.log("Reset song queue");
        }
    });

    var object = {
        songsProcessing: 0,
        /**
         *  Process a single song from the queue
         */
        processOneSong: function processSong(){
            app.log("Getting a song to process");
            app.database.getQueuedSong(function getQueuedSong(err, info){
                if(err){
                    app.error("Error processing queued song: "+err);
                }else {
                    if (info && info[0] && info[0].id) {
                        app.log(`Starting processing song ${info[0].id} (${info[0].status})`);
                        info = info[0];
                        if(info.status == "QUEUED" || info.artist == "Unknown" || info.title == "Unknown")
                            object.getYoutubeInfoForSong(info.id);
                        else
                            object.downloadSong(info);

                        if(object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads"))
                            object.processOneSong();
                    }else{
                        app.log("Nothing to process right now");
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
         * @param playlist The UUID of the playlist to add the song to once downloaded
         */
        queue: function queueSong(url, destination, getLastmData, addedBy, playlist){
            app.log("Received a song to queue "+url+" -> "+destination);
            if(url && destination){
                app.database.addSongToQueue(url, destination, addedBy, null, "Unknown", null, playlist, function addSongToQueue(err, result){
                    if(object.songsProcessing > downloaderConfig.get("maxConcurrentDownloads")){
                        app.log(`Too many songs downloading right now (${object.songsProcessing}), adding ${result[0]} to secondary queue.`);
                        app.database.updateQueuedSong(result[0], {
                            status: 'QUEUED'
                        }, function updateQueuedSongCB(err){
                            if(err)app.warn(`Error updating ${result[0]} status to QUEUED: ${err}`);
                        });
                    }else
                        object.getYoutubeInfoForSong(result[0]);

                });
            }
        },
        getYoutubeInfoForSong: function getYoutubeInfoForSong(id){
            object.songsProcessing++;
                app.database.getQueuedSongInfo(id, function getQueuedSongInfoCB(err, queuedSong) {
                    try {
                        queuedSong = queuedSong[0];
                        if (err) {
                            app.warn("Error getting queued song info for ID " + id);
                            object.songsProcessing--;
                        } else {
                            var options = ["--ignore-errors"];
                            if (proxy)
                                options.push("--proxy=" + proxy);

                            if (downloaderConfig.get("forceIpv4"))
                                options.push("--force-ipv4");

                            if (downloaderConfig.get("allowPlaylists")) {
                                options.push("--yes-playlist");
                                options.push("--flat-playlist");
                            } else
                                options.push("--no-playlist");

                            ytdl.getInfo(queuedSong.url, options, function getYTInfo(err, info) {
                                app.log("Pre-processing song " + id);
                                if (info) {
                                    if (info[0]) {
                                        app.database.removeQueuedSong(id, function removeSongFromQueue(err) {
                                            if (err) app.error("Failed to remove queued song " + id + " from database: " + err);
                                            for (var i in info)
                                                if (info.hasOwnProperty(i))
                                                    object.queue(info[i].url, queuedSong.destination, true, queuedSong.addedby, queuedSong.playlist);
                                        });
                                    } else {
                                        var fixedTitle = info.fulltitle.replace(songRegex, "");

                                        var titleSplit = fixedTitle.split(fixedTitle.indexOf(":") > -1 ? ":" : "-");
                                        var artist = (titleSplit[0] || "Unknown").trim();
                                        var title = (titleSplit[1] || "Unknown").trim();
                                        if (titleSplit.length < 2) {
                                            title = titleSplit[0];
                                            artist = info.uploader;
                                        }
                                        if (info.creator)
                                            artist = info.creator;

                                        if (info.alt_title)
                                            title = info.alt_title;

                                        if(!artist && info.extractor === "Bandcamp" && info.webpage_url){
                                            artist = info.webpage_url.split(".")[0].split("/")[2];
                                        }

                                        artist = artist ? artist.replace(" Listen ad-free with YouTube Red", "").trim() : "Unknown Artist";



                                        app.database.doesSongExist(artist, title, function doesSongExistCB(err, exists) {
                                            if (err) app.warn(`Error checking if song exists: ${err}`);
                                            if (exists) {
                                                app.log(`Queued download ${id} already exists.`);
                                                app.database.updateQueuedSong(id, {
                                                    status: 'DUPLICATE'
                                                }, function updateQueuedSongCB(err) {
                                                    if (err) app.warn(`Error updating queued song: ${err}`);
                                                });

                                                object.songsProcessing--;
                                                if (object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")) {
                                                    object.processOneSong();
                                                }
                                            } else {
                                                app.database.getOrCreateArtist(artist, function createArtist(err, artistId) {
                                                    if (!err) {
                                                        app.database.updateQueuedSong(id, {
                                                            artist: artistId,
                                                            title: title,
                                                            status: 'WAITING'
                                                        }, function (err) {
                                                            if (err) {
                                                                app.error("Error updating queued song: " + err);
                                                            } else {
                                                                app.log(`Successfully got youtube info for ${id}.`);
                                                            }
                                                            object.songsProcessing--;
                                                            if (object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")) {
                                                                object.processOneSong();
                                                            }
                                                        });
                                                    } else {
                                                        app.error(`Error creating artist '${artist}': ${err}`);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    app.error(`Error getting info from youtube for ${id}: ${err}`);
                                    app.database.updateQueuedSong(id, {
                                        status: "FAILED"
                                    }, function updateQueuedSong(err) {
                                        if (err)
                                            app.error(`Failed to set failure status of ${id}: ${err}`);
                                        object.songsProcessing--;
                                        if (object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")) {
                                            object.processOneSong();
                                        }
                                    });
                                }
                            });
                        }
                    }catch(e){
                        app.error(`Error processing ${id}: ${e}`);
                        app.database.updateQueuedSong(id, {
                            status: "FAILED"
                        }, function updateQueuedSong(err) {
                            if (err)
                                app.error(`Failed to set failure status of ${id}: ${err}`);
                            object.songsProcessing--;
                            if (object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")) {
                                object.processOneSong();
                            }
                        });
                    }
                });
        },
        downloadSong: function downloadSong(info){
            var updateErrorHandler = function updateErrorHandler(err){
                if(err){
                    app.error("Failed to update status of "+info.id+": "+err);
                }else{
                    app.log("Successfully updated status of "+info.id)
                }
            };
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
                var downloader = ytdl(info.url, options,{maxBuffer: Infinity});
                var songUUID = uuid();

                downloader.on("error", function songDownloadError(downloadError){
                   app.warn("Error whilst processing song "+info.id);
                   console.log(downloadError);
                    if(info.url.indexOf("youtube") > -1){
                       app.database.updateQueuedSong(info.id, {
                           url: info.url.replace("youtube", "youpak"),
                           status: "WAITING"
                       }, updateErrorHandler);
                    }else{
                       app.database.updateQueuedSong(info.id, {
                           status: "FAILED"
                       }, updateErrorHandler);
                    }
                    object.songsProcessing--;
                    object.processOneSong();
                });

                downloader.on("info", function songInfoStart() {
                    ffmpeg()
                        .input(downloader)
                        .audioCodec(downloaderConfig.get("audioCodec"))
                        .audioFilters("silenceremove=0:0:0:-1:1:-50dB")
                        .save(path.join(info.destination, songUUID + ".mp3"))
                        .on('error', function songDownloadError(err) {
                            app.error("Error downloading video: " + err);
                            app.database.updateQueuedSong(info.id, {
                                status: "FAILED"
                            }, updateErrorHandler);
                            object.songsProcessing--;
                            object.processOneSong();
                        })
                        .on('end', function songDownloadEnd() {
                            app.log("Finished downloading " + info.id);
                            var pathSplit = info.destination.split("/");
                            app.database.getOrCreateGenre((pathSplit[info.destination.endsWith("/") ? pathSplit.length-2 : pathSplit.length-1]).trim(), function createGenre(err, genreID){
                                if(err)app.warn("Error creating genre: "+err);
                                var filePath = path.join(info.destination, songUUID + ".mp3");
                                ffprobe(filePath, function ffprobe(err, data){
                                    if(err){
                                        app.warn("Error probing file: "+path+": "+data);
                                    }

                                    md5file(filePath, function(err, hash){
                                        console.log("Computed hash for "+filePath+" as "+hash);
                                        app.database.addSong({
                                            id: songUUID,
                                            path: filePath,
                                            artist: info.artist,
                                            album: info.album,
                                            hash: err ? null : hash,
                                            addedby: info.addedby,
                                            title: info.title.trim(),
                                            duration: !err ? (data.format.duration || 0) : 0,
                                            genre: genreID ? genreID : "6fe0d616-2f05-40e5-8f9f-a2ecd8052543"
                                        }, function addSong(err) {
                                            if (err) {
                                                app.error("Error adding song to database: "+err);
                                                app.database.updateQueuedSong(info.id, {
                                                    status: "FAILED"
                                                }, updateErrorHandler);
                                            } else {
                                                // app.genreImageGenerator.updateSongFromLastfmData(songUUID, function(){
                                                //     app.broadcastUpdate("alert", {
                                                //         lifetime: 5,
                                                //         title: "Download Finished",
                                                //         body: `${info.title} has downloaded successfully.`,
                                                //         image: "album/"+info.album
                                                //     });
                                                // });
                                                app.database.removeQueuedSong(info.id, updateErrorHandler);
                                                if(info.playlist){
                                                    app.database.addSongToPlaylist(info.playlist, songUUID, function(err){
                                                        if(err)app.warn("Unable to add song "+songUUID+" to playlist "+info.playlist);
                                                    });
                                                }
                                            }
                                            object.songsProcessing--;
                                            object.processOneSong();
                                        });
                                    })

                                });
                            });
                        });
                });
            });
        },
        findAlbumArt: function(){

        },
        findArtistImage: function(){

        }
    };

    app.jobs.addJob("Force Song Download Start", {
        desc: "Forces the song downloader to attempt to download a song.",
        args: [],
        func: function(cb){
            app.downloader.songsProcessing = 0;
            app.downloader.processOneSong();
            if(cb)
                cb();
        }
    });

    app.jobs.addJob("Update youtube-dl", {
        desc: "Checks for updates then updates youtube-dl.",
        args: [],
        func: function(cb){
           var youtubedlUpdater = spawn("node_modules/youtube-dl/bin/youtube-dl", ['-U']);
           youtubedlUpdater.stdout.on('data', function youtubeDlUpdater(data){
               app.log(data);
           });
           youtubedlUpdater.stderr.on('data', function youtubeDlUpdater(data){
               app.error(data);
           });
           if(cb)cb();
        }
    });


    app.jobs.addJob("Fix 0 Length Songs", {
        desc: "Fixes songs with no calculated length",
        args: [],
        func: function(cb){
            app.database.getSongsWithNoLength(function getSongsWithNoLengthCB(err, songs){
               if(err){
                   app.error("Error getting songs with no length: "+err);
                   if(cb)cb(err);
               }else{
                   async.eachSeries(songs, function(song, asyncCB){
                      app.log("Probing song "+song.id+"...");
                       ffprobe(song.path, function ffprobe(err, data){
                           if(err){
                               app.warn("Error probing file: "+path+": "+err);
                               asyncCB();
                           }else{
                               app.log("Done probing");
                               app.database.updateSong(song.id, {
                                   duration: data.format.duration || 0
                               }, function(err){
                                   if(err){
                                       app.error("Error updating song "+song.id+": "+err);
                                   }else{
                                       app.log("Changed song "+song.id+" duration to "+data.format.duration);
                                   }
                                   asyncCB();
                               });
                           }
                       });
                   }, cb);
               }
            });
        }
    });

    return object;
};