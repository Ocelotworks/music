/*
* Copyright Ocelotworks 2016
 */

var config  = require('config').get("Database");
var knex    = require('knex')(config);
var uuid    = require('uuid').v4;


module.exports = function(app){
    return {
        name: "Database Handler",
        init: function(cb){

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
            })
        },
        getOrCreateAlbum: function(album, cb){

        },
        addSongToQueue: function(url, destination, addedby, artist, title, album, cb){
            function exec(url, destination, addedById, artistId, title, albumId){

            }

            if(artist){
                module.exports.getOrCreateArtist()
            }
        }
    }
};