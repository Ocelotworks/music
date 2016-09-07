/*
* Copyright Ocelotworks 2016
 */

var config  = require('config').get("Database");
var knex    = require('knex')(config);
var uuid    = require('uuid').v4;


module.exports = function(app){
    var object = {
        name: "Database Handler",
        init: function(cb){

        },
        addSong: function(song, cb){
            knex("songs").insert(song).asCallback(cb);
        },
        getAllSongs: function(cb){
            knex.select().from("songs").orderBy("artist", "desc").asCallback(cb);
        },
        getSongList: function(cb){
            knex.from("songs").innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        getSongInfo: function(id, cb){
            knex.select("uuid", "artist", "album", "plays", "genre", "duration").from("songs").where({id: id}).asCallback(cb);
        },
        getSongPath: function(id, cb){
            knex.select("path").from("songs").where({id: id}).limit(1).asCallback(cb);
        },
        getArtistFromSong: function(song, cb){
            knex.select("name", "id").from("artists").where({id: knex.select("artist").from("songs").where({id: song})}).asCallback(cb);
        },
        getSongsFromArtist: function(artist, cb){
            knex.select("uuid", "artist", "album", "plays", "genre", "duration").from("songs").where({artist: artist}).asCallback(cb);
        },
        getOrCreateArtist: function(artist, cb){
            knex.select("id").from("artists").where({name: artist}).limit(1).asCallback(function(err, res){
                if(err)
                    cb(err);
                else{
                    if(res.length === 1){
                        console.log("Artist "+artist+" already exists");
                        cb(null, res[0].id);
                    }else{
                        console.log("Creating new artist "+artist);
                        var id = uuid();
                        knex('artists').insert({
                            name: artist,
                            id: id
                        }).asCallback(function(err){
                            cb(err, id);
                        });
                    }
                }
            });
        },
        getOrCreateAlbum: function(album, cb){
            knex.select("id").from("albums").where({name: album}).limit(1).asCallback(function(err, res){
                if(err)
                    cb(err);
                else{
                    if(res.length === 1){
                        console.log("Album "+album+" already exists");
                        cb(null, res[0].id);
                    }else{
                        console.log("Creating new album "+album);
                        var id = uuid();
                        knex('albums').insert({
                            name: album,
                            id: id
                        }).asCallback(function(err){
                            cb(err, id);
                        });
                    }
                }
            });
        },
        getSongQueue: function(cb){
            knex.select().from("queue").innerJoin("artists", "queue.artist", "artists.id").innerJoin("users", "queue.addedby", "users.id").asCallback(cb);
        },
        getQueuedSong: function(cb){
          knex.select().from("queue").whereNot({status: 'FAILED'}).limit(1).asCallback(cb);
        },
        removeQueuedSong: function(id, cb){
          knex("queue").where({id: id}).delete().asCallback(cb);
        },
        updateQueuedSong: function(id, update, cb){
            console.log("Updating queued song "+id);
            knex("queue").where({id: id}).update(update).asCallback(cb);
        },
        addSongToQueue: function(url, destination, addedby, artist, title, album, cb){
            function exec(url, destination, addedById, artistId, title, albumId){
                knex("queue").insert({
                    url: url,
                    destination: destination,
                    addedby: addedById,
                    artist: artistId,
                    title: title,
                    album: albumId
                }).asCallback(cb);
            }

            function albumBit(url, destination, addedById, artistId, title, album){
               object.getOrCreateAlbum(album || "Unknown Album", function(err, albumId){
                   if(err){
                       console.error("Error adding song to download queue: could not get album: "+err)
                   } else{
                       exec(url, destination, addedById, artistId, title, albumId);
                   }
                });
            }

            object.getOrCreateArtist(artist || "Unknown Artist", function(err, artistId){
               if(err)
                   console.error("Error adding song to download queue: could not get artist: "+err);

               albumBit(url, destination, addedby, artistId, title, album);
            });

        }
    };

    return object;
};