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
        getAllArtists: function(cb){
            knex.select("name", "id").from("artists").distinct("name").orderBy("name", "asc").asCallback(cb);
        },
        getAllAlbums: function(cb){
            knex.select("name", "id").from("albums").distinct("name").orderBy("name", "desc").asCallback(cb);
        },
        getSongsByArtist: function(artist, cb){
            knex.from("songs").where({artist: artist}).innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        getSongsByAlbum: function(album, cb){
            knex.from("songs").where({album: album}).innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        getSongList: function(cb){
            knex.from("songs").innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album").orderBy("artists.name", "ASC").asCallback(cb);
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
        updateAlbumArt: function(album, blob, cb){
          knex("albums").update({image: blob}).where({id: album}).asCallback(cb);
        },
        getAlbumArt: function(album, cb){
            knex.select("image").from("albums").where({id: album}).limit(1).asCallback(cb);
        },
        getOrCreateGenre: function(genre, cb){
            knex.select("id").from("genres").where({name: genre}).limit(1).asCallback(function(err, res){
                if(err)
                    cb(err);
                else{
                    if(res.length === 1){
                        console.log("Genre "+genre+" already exists");
                        cb(null, res[0].id);
                    }else{
                        console.log("Creating new genre "+genre);
                        var id = uuid();
                        knex('genres').insert({
                            name: genre,
                            id: id
                        }).asCallback(function(err){
                            cb(err, id);
                        });
                    }
                }
            });
        },
        getSongQueue: function(cb){
            knex.select().from("queue").innerJoin("artists", "queue.artist", "artists.id").innerJoin("users", "queue.addedby", "users.id").orderBy("queue.id", "DESC").asCallback(cb);
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

        },
        getOrCreateUser: function(identifier, username, avatar, strategy, cb){
            knex.select().from("users").where({authkey: identifier}).limit(1).asCallback(function(err, res){
                if(err){
                    cb(err, null);
                }else{
                    if(res.length === 1){

                        console.log("User "+res[0].id+" already exists");
                        cb(null, res[0]);
                    }else{
                        console.log("Creating new user "+username);
                        var id = uuid();
                        var user = {
                            username: username,
                            id: id,
                            avatar: avatar,
                            userlevel: 0,
                            authtype: strategy,
                            authkey: identifier
                        };
                        knex('users').insert(user).asCallback(function(err){
                            cb(err, user);
                        });
                    }
                }
            });
        },
        getUserInfo: function(id, cb){
            knex.select().from("users").where({id: id}).limit(1).asCallback(function(err, res){
                if(res[0])cb(err, res[0]);
                else cb(err, null);
            });
        },
        search: function(query, cb){
            knex.select("title", "name", "songs.id AS song_id", "artists.id AS artist_id", "album")
                .from("songs")
                .join("artists", "songs.artist", "artists.id")
                .where(knex.raw("MATCH(title) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        createPlaylist: function(playlist, cb){
            var id = uuid();
            knex("playlists").insert({
                id: id,
                name: playlist.name,
                private: playlist.private,
                owner: playlist.addedby
            }).asCallback(cb);
            for(var i in playlist.songs)
                if(playlist.songs.hasOwnProperty(i))
                    knex("playlist_data").insert({
                        position: i,
                        song_id: playlist.songs[i],
                        playlist_id: id
                    }).asCallback(function(err){
                        if(err)console.warn("Warning: error inserting song into playlist "+id+": "+err);
                    });
        },
        getPublicPlaylists: function(cb){
            knex.select("name", "playlists.id", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("private", 0)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        getPrivatePlaylists: function(id, cb){
            knex.select("name", "private", "playlists.id", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("private", 1)
                .andWhere("owner", id)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        getPlaylistInfo: function(id, cb){
            knex.select("name", "private", "playlists.id", "owner", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("playlists.id", id)
                .limit(1)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        getSongsByPlaylist: function(id, cb){
            knex.select("position", "artist AS artist_id", "album", "title", "name", "song_id")
                .from("playlist_data")
                .innerJoin("songs", "song_id", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .where({playlist_id: id})
                .orderBy("position", "DESC")
                .asCallback(cb);
        },
        getDetailedSongInfo: function(id, cb){
            knex.select("songs.id AS song_id", "genres.id AS genre_id",
                "albums.id AS album_id", "artists.id AS artist_id", "songs.plays",
                "songs.duration", "songs.title", "artists.name AS artist_name",
                "albums.name AS album_name", "genres.name AS genre_name", "username", "avatar", "userlevel")
                .from("songs")
                .innerJoin("albums", "songs.album", "albums.id")
                .innerJoin("genres", "songs.genre", "genres.id")
                .innerJoin("users", "songs.addedby", "users.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .where({'songs.id': id})
                .limit(1)
                .asCallback(cb);
        },
        generateApiKey: function(id, cb){
            knex("api_keys").update({revoked: 1}).where({revoked: 0, owner: id}).asCallback(function(err, res){
                if(err){
                    cb(err, null);
                }else{
                    var newKey = uuid();
                    knex("api_keys").insert({owner: id, id: newKey}).asCallback(function(err, res){
                       if(err){
                           cb(err, null);
                       } else{
                           cb(null, newKey);
                       }
                    });
                }
            })
        },
        getSettingsForUser: function(id, cb){
            knex.select().from("settings").where({owner: id}).asCallback(cb);
        },
        getApiKeyFromUser: function(id, cb){
            knex.select("id").from("api_keys").where({owner: id, revoked: 0}).limit(1).asCallback(cb);
        },
        getUserFromApiKey: function(key, cb){
            knex.select("owner").from("api_keys").where({id: key, revoked: 0}).limit(1).asCallback(cb);
        }
    };

    return object;
};