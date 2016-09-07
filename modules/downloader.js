/*
* Copyright 2016 Ocelotworks
 */


var config = require('config');
var ytdl   = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');
var path   = require('path');
var uuid   = require('uuid').v4;
var songRegex = /\{*.\)|lyrics|official/g;

module.exports = function(app){
    var object = {
        songsProcessing: 0,

        processOneSong: function(){
            app.database.getQueuedSong(function(err, info){
                if(err){
                    console.log("Error processing queued song: "+err);
                }else {
                    if (info && info[0] && info[0].id) {

                        info = info[0];
                        object.songsProcessing++;
                        app.database.updateQueuedSong(info.id, {
                            status: "PROCESSING"
                        }, function () {
                            var options = [];
                            var downloaderConfig = config.get("Downloader");
                            var proxy = downloaderConfig.get("proxy");
                            if (proxy)
                                options.push("--proxy " + proxy);

                            if (downloaderConfig.get("forceIpv4"))
                                options.push("--force-ipv4");
                            var downloader = ytdl(info.url, options);
                            var songUUID = uuid();
                            downloader.on("info", function () {
                                ffmpeg()
                                    .input(downloader)
                                    .audioCodec(downloaderConfig.get("audioCodec"))
                                    .save(path.join(info.destination, songUUID + ".mp3"))
                                    .on('error', function (err) {
                                        console.log("Error downloading video: " + err);
                                        app.database.updateQueuedSong(info.id, {
                                            status: "FAILED"
                                        }, function () {
                                        });
                                    })
                                    .on('end', function () {
                                        console.log("Finished downloading " + info.id);
                                        app.database.addSong({
                                            id: songUUID,
                                            path: path.join(info.destination, songUUID + ".mp3"),
                                            artist: info.artist,
                                            album: info.album,
                                            addedby: info.addedby,
                                            title: info.title,
                                            duration: 0,
                                            genre: "memes"
                                        }, function (err, res) {
                                            if (err) {
                                                app.database.updateQueuedSong(info.id, {
                                                    status: "FAILED"
                                                }, function () {
                                                });
                                            } else {
                                                app.database.removeQueuedSong(info.id, function () {
                                                });
                                            }
                                            object.songsProcessing--;
                                            object.processOneSong();
                                        });
                                    });
                            });
                        });
                    }
                }
            });
        },
        queue: function(url, destination, getLastmData, addedBy){
            console.log("Received a song to queue "+url+" -> "+destination);
            if(url && destination){
                app.database.addSongToQueue(url, destination, "c999f4ab-72a6-11e6-839f-00224dae0d2a", null, "Unknown", null, function(err, result){
                    var id = result[0];
                    var options = ["--ignore-errors"];
                    var downloaderConfig = config.get("Downloader");
                    var proxy = downloaderConfig.get("proxy");
                    if(proxy)
                        options.push("--proxy "+proxy);

                    if(downloaderConfig.get("forceIpv4"))
                        options.push("--force-ipv4");

                    if(downloaderConfig.get("allowPlaylists")) {
                        options.push("--yes-playlist");
                        options.push("--flat-playlist");
                    } else
                        options.push("--no-playlist");

                    ytdl.getInfo(url, options, function(err, info){

                        console.log("Pre-processing song "+id);
                        if(info) {
                            if(info[0]){
                                app.database.removeQueuedSong(id, function(err, res){
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

                                app.database.getOrCreateArtist(artist, function(err, artistId){
                                    if(!err){
                                        app.database.updateQueuedSong(id, {
                                            artist: artistId,
                                            title: title
                                        }, function(err, res){
                                            if(err){
                                                console.log("Error updating queued song: "+err);
                                            }else{
                                                console.log("Success!");
                                                if(object.songsProcessing < downloaderConfig.get("maxConcurrentDownloads")){
                                                    object.processOneSong();
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }else{
                            console.log("Error: "+err);
                            app.database.updateQueuedSong(id, {
                                status: "FAILED"
                            });
                        }

                    });
                });
            }
        }
    };

    return object;
};