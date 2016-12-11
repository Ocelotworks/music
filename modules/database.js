/*
* Copyright Ocelotworks 2016
 */

var config  = require('config').get("Database");
var knex    = require('knex')(config);
var uuid    = require('uuid').v4;
var async   = require('async');


module.exports = function(app){
    var object = {
        name: "Database Handler",
        init: function(cb){

        },
        /**
         * Returns the knex instance
         * @returns {*}
         */
        getKnex: function getKnex(){
            return knex;
        },
        /**
         * Inserts a song into the song table
         * @param song A song object, containing the mandatory fields at minimum (See the database structure)
         * @param cb A callback, returning err as the first argument if the insert failed.
         */
        addSong: function addSong(song, cb){
            knex("songs").insert(song).asCallback(cb);
        },
        /**
         * Gets every song in order
         * @param cb
         */
        getAllSongs: function getAllSongs(cb){
            knex.select().from("songs").orderBy("artist", "desc").asCallback(cb);
        },
        /**
         * Gets every artist in name order
         * @param cb
         */
        getAllArtists: function getAllArtists(cb){
            knex.select("name", "id").from("artists").distinct("name").orderBy("name", "asc").asCallback(cb);
        },
        /**
         * Gets every album in name order
         * @param cb
         */
        getAllAlbums: function getAllAlbums(cb){
            knex.select("name", "id").from("albums").distinct("name").orderBy("name", "desc").asCallback(cb);
        },
        /**
         * Gets every genre in name order
         * @param cb
         */
        getAllGenres: function getAllGenres(cb){
            knex.select("name", "id").from("genres").distinct("name").orderBy("name", "desc").asCallback(cb);
        },
        /**
         * Gets every song by a specific artist ID
         * @param artist the UUID of the artist
         * @param cb
         */
        getSongsByArtist: function getSongsByArtist(artist, cb){
            knex.from("songs").where({artist: artist}).innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        /**
         * Gets every song by a specific album ID
         * @param album the UUID of the album
         * @param cb
         */
        getSongsByAlbum: function getSongsByAlbum(album, cb){
            knex.from("songs").where({album: album}).innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        /**
         * Gets every song by a specific genre ID
         * @param genre the UUID of the genre
         * @param cb
         */
        getSongsByGenre: function getSongsByGenre(genre, cb){
            knex.from("songs").where({genre: genre}).innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title").asCallback(cb);
        },
        /**
         * Gets a list of songs, including artist and album name, sorted by artist
         * @param cb
         */
        getSongList: function getSongList(cb){
            knex.from("songs").innerJoin("artists", "songs.artist", "artists.id").select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album").orderBy("artists.name", "ASC").asCallback(cb);
        },
        /**
         * Gets information about a certain song
         * @param id The song UUID
         * @param cb
         */
        getSongInfo: function getSongInfo(id, cb){
            knex.select("*").from("songs").where({id: id}).asCallback(cb);
        },
        /**
         * Returns the UUID of the user who added a song
         * @param id The song UUID
         * @param cb function(err, userID)
         */
        getSongOwner: function getSongOwner(id, cb){
            knex.select("addedby").from("songs").where({id: id}).limit(1).asCallback(function getSongOwnerCB(err, resp){
               cb(err, resp ? resp[0].addedby : null);
            });
        },
        /**
         * Deletes a song, and triggers cleanup
         * @param id The song UUID
         * @param cb function(err)
         */
        deleteSong: function deleteSong(id, cb){
            knex.delete()
                .from("songs")
                .where({id: id})
                .limit(1)
                .asCallback(cb);
            cb(null);
            object.cleanupAll(function cleanupAllCB(err){
                if(err)
                    app.error("Error cleaning up: "+err);
            });
        },
        /**
         * Calls cleanupAlbums, cleanupPlaylists, cleanupArtists
         * @see cleanupAlbums
         * @see cleanupPlaylists
         * @see cleanupArtists
         * @see cleanupGenres
         * @param cb
         */
        cleanupAll: function cleanupAll(cb){
            app.log("Starting cleanup");
            async.series([
                object.cleanupAlbums,
                object.cleanupPlaylists,
                object.cleanupArtists,
                object.cleanupGenres
            ], cb);
        },
        /**
         * Removes all orphaned albums
         * @param cb
         */
        cleanupAlbums: function cleanupAlbums(cb){
            knex.delete()
                .from("albums")
                .whereNotIn("id", knex.select("album").from("songs")).asCallback(cb);
        },
        /**
         * Removes all orphaned playlist data
         * @param cb
         */
        cleanupPlaylists: function cleanupPlaylists(cb){
            knex.delete()
                .from("playlist_data")
                .whereNotIn('song_id', knex.select("id").from("songs").whereRaw("id = playlist_data.song_id")).asCallback(cb);

        },
        /**
         * Removes all orphaned artists (excluding Louis Armstrong)
         * @param cb
         */
        cleanupArtists: function cleanupArtists(cb){
            knex.delete()
                .from("artists")
                .whereNotIn("id", knex.select("artist").from("songs")).asCallback(cb);
        },
        /**
         * Removes all orphaned genres
         * @param cb
         */
        cleanupGenres: function cleanupGenres(cb){
            knex.delete()
                .from("genres")
                .whereNotIn("id", knex.select("genre").from("songs")).asCallback(cb);
        },
        /**
         * Gets the path of a song, and logs the play
         * @param id the song UUID
         * @param userid the UUID of the user playing the song
         * @param cb function(err, path)
         */
        getSongPathToPlay: function getSongPathToPlay(id, userid, cb){
            knex.select("path").from("songs").where({id: id}).limit(1).asCallback(cb);
        },
        addPlayForSong: function addPlayForSong(id, userid, cb){
            knex("plays").insert({
                user: userid,
                song: id
            }).asCallback(function getSongPathToPlayCB(err){
                if(err)
                    app.warn("Error adding play for song "+id+": "+err);
            });
        },
        /**
         * Gets the artist name from a song ID
         * @param song the song ID
         * @param cb
         */
        getArtistFromSong: function getArtistFromSong(song, cb){
            knex.select("name", "id").from("artists").where({id: knex.select("artist").from("songs").where({id: song})}).asCallback(cb);
        },
        getArtistFromId: function getArtistFromId(id, cb){
            knex.select().from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        getArtistImage: function getArtistImage(id, cb){
            knex.select("image").from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Gets an artists name from their ID
         * @param id The UUID
         * @param cb
         */
        getArtistName: function getArtistName(id, cb){
            knex.select("name").from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Updates an artists image
         * @param id
         * @param image
         * @param cb
         */
        updateArtistImage: function updateArtistImage(id, image, cb){
            knex("artists").update({image: image}).where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Gets the songs from an artist TODO: Is this a duplicate of getSongsByArtist?
         * @param artist
         * @param cb
         */
        getSongsFromArtist: function getSongsFromArtist(artist, cb){
            knex.select("uuid", "artist", "album", "plays", "genre", "duration").from("songs").where({artist: artist}).asCallback(cb);
        },
        /**
         * Attempts to find an artist with the name provided, if none is found, creates a new artist
         * @param artist
         * @param cb
         */
        getOrCreateArtist: function getOrCreateArtist(artist, cb){
            knex.select("id").from("artists").where({name: artist}).limit(1).asCallback(function getOrCreateArtistQuery(err, res){
                if(err)
                    cb(err);
                else{
                    if(res.length === 1){
                        app.log("Artist "+artist+" already exists");
                        cb(null, res[0].id);
                    }else{
                        app.log("Creating new artist "+artist);
                        var id = uuid();
                        knex('artists').insert({
                            name: artist,
                            id: id
                        }).asCallback(function(err){
                            cb(err, id);
                        });
                        app.genreImageGenerator.updateArtistImage(id);
                    }
                }
            });
        },
        /**
         * Attempts to find an album with the name provided, if none is found, creates a new album
         * @param album
         * @param artist
         * @param cb
         */
        getOrCreateAlbum: function getOrCreateAlbum(album, artist, cb){
            knex.select("id").from("albums").where({name: album, artist: artist}).limit(1).asCallback(function getOrCreateAlbum(err, res){
                if(err)
                    cb(err);
                else{
                    if(res.length === 1){
                        app.log("Album "+album+" already exists");
                        cb(null, res[0].id);
                    }else{
                        app.log("Creating new album "+album);
                        var id = uuid();
                        knex('albums').insert({
                            name: album,
                            artist: artist,
                            id: id
                        }).asCallback(function(err){
                            cb(err, id);
                        });
                    }
                }
            });
        },
        /**
         * Changes the album art of an album
         * @param album the UUID of the album
         * @param blob A binary blob of the album art
         * @param cb
         */

        updateAlbumArt: function updateAlbumArt(album, blob, cb){
          knex("albums").update({image: blob}).where({id: album}).asCallback(cb);
        },
        /**
         * Gets the album art from an album
         * @param album The UUID of the album
         * @param cb function(err, blob)
         */
        getAlbumArt: function getAlbumArt(album, cb){
            knex.select("image").from("albums").where({id: album}).limit(1).asCallback(cb);
        },
        /**
         * Tries to find a specific genre, if none is found, creates a new genre
         * @param genre the name of the genre
         * @param cb
         */
        getOrCreateGenre: function getOrCreateGenre(genre, cb){
            knex.raw("select `id`, image IS NULL as needsImage from `genres` where `name` = '"+genre+"' LIMIT 1").asCallback(function getOrCreateGenre(err, res){ //DANGER!
                if(err)
                    cb(err);
                else{
                    if(res.length > 0){
                        app.log("Genre "+genre+" already exists");
                        if(res[0].needsImage)app.genreImageGenerator.generateImageForGenre(res[0].id);
                        cb(null, res[0].id);
                    }else{
                        app.log("Creating new genre "+genre);
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
        /**
         * Get the generated image for a genre
         * @param genre
         * @param cb
         */
        getGenreArt: function getGenreArt(genre, cb){
            knex.select("image").from("genres").where({id: genre}).limit(1).asCallback(cb);
        },
        /**
         * Gets the songs currently queued for download
         * @param cb
         */
        getSongQueue: function getSongQueue(cb){
            knex.select().from("queue").innerJoin("artists", "queue.artist", "artists.id").innerJoin("users", "queue.addedby", "users.id").orderBy("queue.id", "DESC").asCallback(cb);
        },
        /**
         * Gets the next song to download
         * @param cb
         */
        getQueuedSong: function getQueuedSong(cb){
          knex.select().from("queue").whereNot({status: 'FAILED'}).orWhereNot({status: 'DUPLICATE'}).limit(1).asCallback(cb);
        },
        /**
         * Removes a song from the download queue
         * @param id The ID of the queued item
         * @param cb
         */
        removeQueuedSong: function removeQueuedSong(id, cb){
          knex("queue").where({id: id}).delete().asCallback(cb);
        },
        /**
         * Update the status of a queued download
         * @param id the ID of the queued item
         * @param update the new status (FAILED,PROCESSING,DONE)
         * @param cb
         */
        updateQueuedSong: function updateQueuedSong(id, update, cb){
            app.log("Updating queued song "+id);
            knex("queue").where({id: id}).update(update).asCallback(cb);
        },
        /**
         * Adds a song to the download queue
         * @param url The URL of the item to download
         * @param destination The destination path
         * @param addedby The UUID of the user that queued the song
         * @param artist The artist UUID
         * @param title The title
         * @param album The album UUID
         * @param cb
         */
        addSongToQueue: function addSongToQueue(url, destination, addedby, artist, title, album, cb){
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

            function albumBit (url, destination, addedById, artistId, title, album){
               object.getOrCreateAlbum(album || "Unknown Album", artistId, function getOrCreateAlbumCB(err, albumId){
                   if(err){
                       app.error("Error adding song to download queue: could not get album: "+err)
                   } else{
                       exec(url, destination, addedById, artistId, title, albumId);
                   }
                });
            }

            object.getOrCreateArtist(artist || "Unknown Artist", function getOrCreateArtistCB(err, artistId){
               if(err)
                   app.error("Error adding song to download queue: could not get artist: "+err);

               albumBit(url, destination, addedby, artistId, title, album);
            });

        },
        /**
         * Retrieves or creates a user account from an oauth
         * @param identifier The token from the oauth
         * @param username The username
         * @param avatar The avatar URL
         * @param strategy The login strat used (TWITTER,GOOGLE,BOT if it is a manually added account)
         * @param cb
         */
        getOrCreateUser: function getOrCreateUser(identifier, username, avatar, strategy, cb){
            knex.select().from("users").where({authkey: identifier}).limit(1).asCallback(function getOrCreateUserCB(err, res){
                if(err){
                    cb(err, null);
                }else{
                    if(res.length === 1){

                        app.log("User "+res[0].id+" already exists");
                        cb(null, res[0]);
                    }else{
                        app.log("Creating new user "+username);
                        var id = uuid();
                        var user = {
                            username: username,
                            id: id,
                            avatar: avatar,
                            userlevel: 0,
                            authtype: strategy,
                            authkey: identifier
                        };
                        knex('users').insert(user).asCallback(function createUserCB(err){
                            cb(err, user);
                        });
                    }
                }
            });
        },
        /**
         * Retrieve information about a certain user
         * @param id The UUID of the user
         * @param cb
         */
        getUserInfo: function getUserInfo(id, cb){
            knex.select().from("users").where({id: id}).limit(1).asCallback(function getUserInfoCB(err, res){
                if(res[0])cb(err, res[0]);
                else cb(err, null);
            });
        },
        /**
         * Search for songs
         * @param query
         * @param cb
         */
        searchSongs: function searchSongs(query, cb){
            knex.select("title", "name", "songs.id AS song_id", "artists.id AS artist_id", "album")
                .from("songs")
                .join("artists", "songs.artist", "artists.id")
                .where(knex.raw("MATCH(title) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Search for artists
         * @param query
         * @param cb
         */
        searchArtists: function searchArtists(query, cb){
            knex.select("name", "id")
                .from("artists")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Search for albums
         * @param query
         * @param cb
         */
        searchAlbums: function searchAlbums(query, cb){
            knex.select("name", "id")
                .from("albums")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Search for genres
         * @param query
         * @param cb
         */
        searchGenres: function searchGenres(query, cb){
            knex.select("name", "id")
                .from("genres")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Create a playlist
         * @param playlist The playlist object, as defined by the form in templates.js
         * @see templates.js
         * @param cb
         */
        createPlaylist: function createPlaylist(playlist, cb){
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
                        if(err)app.warn("Warning: error inserting song into playlist "+id+": "+err);
                    });
        },
        /**
         * Deletes a playlist and all it's songs. Executes cb when the playlist object has been deleted and not when the playlist data has.
         * @param id
         * @param cb
         */
        deletePlaylist: function deletePlaylist(id, cb){
            knex("playlists").delete().where({id: id}).limit(1).asCallback(cb);
            knex("playlist_data").delete().where({playlist_id: id}).asCallback(function deletePlaylistDataCB(err){
                if(err)
                    app.warn("Could not delete playlist_data entries for "+id);
            });
        },
        /**
         * Get all playlists that are not marked as private
          * @param cb
         */
        getPublicPlaylists: function getPublicPlaylists(cb){
            knex.select("name", "playlists.id", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("private", 0)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        /**
         * Looks up if a user can perform administrative functions on a playlist
         * @param id The UUID of the playlist
         * @param user The UUID of the user
         * @param cb function(err, canEdit)
         */
        canUserEditPlaylist: function canUserEditPlaylist(id, user, cb){
          knex.select(knex.raw("count(*)")).from("playlists").where({id: id, owner: user}).limit(1).asCallback(function canUserEditPlaylistCB(err, res){
                  if(err){
                      cb(err, false);
                  }else{
                      cb(null, res[0] && res[0]["count(*)"]);
                  }
          });
        },
        /**
         * Get all playlists owned by a certain user
         * @param id The user UUID
         * @param cb
         */
        getPrivatePlaylists: function getPrivatePlaylists(id, cb){
            knex.select("name", "private", "playlists.id", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("private", 1)
                .andWhere("owner", id)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        /**
         * Get all playlists owned by a certain user, regardless of visibility status
         * @param id User UUID
         * @param cb
         */
        getOwnedPlaylists: function getOwnedPlaylists(id, cb){
            knex.select("name", "private", "playlists.id AS id")
                .from("playlists")
                .where("owner", id)
                .asCallback(cb);
        },
        /**
         * Get information about a certain playlist
         * @param id The playlist UUID
         * @param cb
         */
        getPlaylistInfo: function getPlaylistInfo(id, cb){
            knex.select("name", "private", "playlists.id", "owner", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlists")
                .where("playlists.id", id)
                .limit(1)
                .join("users", "playlists.owner", "users.id")
                .asCallback(cb);
        },
        /**
         * Get all the songs in a playlist
         * @param id The playlist UUID
         * @param cb
         */
        getSongsByPlaylist: function getSongsByPlaylist(id, cb){
            knex.select("position", "artist AS artist_id", "album", "title", "name", "song_id")
                .from("playlist_data")
                .innerJoin("songs", "song_id", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .where({playlist_id: id})
                .orderBy("position", "ASC")
                .asCallback(cb);
        },
        /**
         * Get all playlists that contain a certain song
         * @param id The UUID of the song
         * @param user The UUID of the user
         * @param cb
         */
        getPlaylistsBySong: function getPlaylistsBySong(id, user, cb){
            knex.select("name", "private", "playlists.id", "owner", knex.raw("(SELECT count(*) FROM playlist_data WHERE playlist_id = playlists.id) AS count"), "users.username", "users.avatar", "users.userlevel")
                .from("playlist_data")
                .innerJoin("playlists", "playlist_data.playlist_id", "playlists.id")
                .innerJoin("users", "playlists.owner", "users.id")
                .where({song_id: id})
                .andWhere(function getPlaylistsBySongAndCondition(){
                    this.where({"playlists.private": 0}).orWhere({"playlists.owner": user})
                }).asCallback(cb);
        },
        addSongToPlaylist: function addSongToPlaylist(playlist, song, cb){
            knex("playlist_data").insert({
                song_id: song,
                playlist_id: playlist,
                position: 999 //TODO: Positioning
            }).asCallback(cb);
        },
        /**
         * Checks whether a song with `id` exists
         * @param id
         * @param cb function(err, exists)
         */
        getSongExists: function getSongExists(id, cb){
              knex("songs").select("COUNT(*) as exists").where({id: id}).limit(1).asCallback(function(err, result){
                 if(err){
                     cb(err, null);
                 } else{
                     cb(err, result[0].exists)
                 }
              });
        },
        /**
         * Gets information about who added a song, it's album, it's duration, etc
         * @param id The song UUID
         * @param cb
         */
        getDetailedSongInfo: function getDetailedSongInfo(id, cb){
            knex.select("songs.id AS song_id", "genres.id AS genre_id",
                "albums.id AS album_id", "artists.id AS artist_id",
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
        /**
         * Generate a new key and invalidate all the old oens
         * @param id The UUID of the user to assign to the key
         * @param cb
         */
        generateApiKey: function generateApiLey(id, cb){
            knex("api_keys").update({revoked: 1}).where({revoked: 0, owner: id}).asCallback(function revokeApiKeyCB(err, res){
                if(err){
                    cb(err, null);
                }else{
                    var newKey = uuid();
                    knex("api_keys").insert({owner: id, id: newKey}).asCallback(function createApiKeyCB(err, res){
                       if(err){
                           cb(err, null);
                       } else{
                           cb(null, newKey);
                       }
                    });
                }
            })
        },
        /**
         * Get the current valid API key for a user
         * @param id The user UUID
         * @param cb
         */
        getApiKeyFromUser: function getApiKeyFromUser(id, cb){
            knex.select("id").from("api_keys").where({owner: id, revoked: 0}).limit(1).asCallback(cb);
        },
        /**
         * Get the user that owns a certain API key, ONLY if the API key is not revoked
         * @param key The API key
         * @param cb
         */
        getUserFromApiKey: function getUserFromApiKey(key, cb){
            knex.select("users.*").innerJoin("users", "api_keys.owner", "users.id").from("api_keys").where({"api_keys.id": key, revoked: 0}).limit(1).asCallback(cb);
        },
        /**
         * Adds a vote for a song
         * @param song The UUID of the song
         * @param user The UUID of the user
         * @param up bool, true if upvote, false if downvote
         * @param cb function(err)
         */
        addSongVote: function addSongVote(song, user, up, cb){
            knex("votes").insert({
                owner: user,
                song: song,
                up: up ? 1 : 0
            }).asCallback(cb);
        },
        getAlbumArtForGenreImage: function getAlbumArtForGenreImage(genre, cb){
            knex.select("image")
                .from("songs")
                .where({genre: genre})
                .whereNotNull("albums.image")
                .innerJoin("albums", "songs.album", "albums.id")
                .orderByRaw("RAND()")
                .limit(4)
                .asCallback(cb);
        },
        putGenreImage: function putGenreImage(genre, image, cb){
            knex("genres").update({image: image}).where({id: genre}).limit(1).asCallback(cb);
        },
        /**
         * Logs an error
         * @param type ENUM('PAGE_ERROR','APP_ERROR','DATABASE_ERROR','SECURITY','OTHER')
         * @param detail MAX 128 CHARS
         * @param trace MAX 128 CHARS
         * @param cb function(err)
         */
        logError: function logError(type, detail, trace, cb){
            knex("log").insert({
                event: type,
                detail: detail,
                trace: trace
            }).asCallback(cb);
        },
        /**
         * Clears all failed downloads from the download queue
         * @param cb function(err)
         */
        clearFailedDownloads: function clearFailedDownloads(cb){
            knex("queue").delete().where({status: 'FAILED'}).asCallback(cb);
        },
        /**
         * Returns a table of total plays, title, artist, minutes listened, sorted by plays
         * @param cb
         */
        getMostPlayedStats: function getMostPlayedStats(cb){
            knex.select(knex.raw("COUNT(*) AS plays"), "songs.title", "artists.name", knex.raw("(COUNT(*)*songs.duration) AS seconds"), knex.raw("(COUNT(*)/(SELECT COUNT(*) FROM plays))*100 AS percentage"))
                .from("plays")
                .innerJoin("songs", "plays.song", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .groupBy("song")
                .orderBy(knex.raw("COUNT(*)"), "DESC")
                .limit(10)
                .asCallback(cb);
        },
        getOverallStats: function getOverallStats(cb){
          knex.select(knex.raw("SUM(songs.duration) AS seconds"), knex.raw("COUNT(*) as total"), knex.raw("(SELECT AVG(duration) FROM songs) AS averageDuration"))
              .from("plays")
              .innerJoin("songs", "plays.song", "songs.id")
              .asCallback(cb);
        },
        /**
         * Checks if a song with artist artistName and song songName exists already
         * @param artistName The exact name of the artist to look up
         * @param songName The exact name of the song to look up
         * @param cb function(err, exists)
         */
        doesSongExist: function doesSongExist(artistName, songName, cb){
            knex.select(knex.raw("COUNT(*) AS 'exists'"))
                .from("songs")
                .innerJoin("artists", "artists.id", "songs.artist")
                .where({"songs.title": songName, "artists.name": artistName})
                .asCallback(function(err, result){
                    cb(err, result && result[0] ? result[0].exists : null);
                });
        },
        getQueuedSongInfo: function getQueuedSongInfo(id, cb){
            knex.select("*")
                .from("queue")
                .where({id: id})
                .limit(1)
                .asCallback(cb);
        },
        addDevice: function addDevice(device, cb){
            knex("devices").insert(device).asCallback(cb);
        },
        updateDeviceLastSeen: function updateDeviceLastSeen(device, cb){
            knex("devices").update({lastSeen: knex.raw("CURRENT_TIMESTAMP()")}).where({id: device}).limit(1).asCallback(cb);
        },
        getDevicesByUser: function getDevicesByUser(user, cb){
            knex.select("*").from("devices").where({owner: user}).asCallback(cb);
        },
        getDevicesForSettings: function getDevicesForSettings(user, cb){
            knex.select(knex.raw("TIMESTAMPDIFF(SECOND, lastSeen, CURRENT_TIMESTAMP()) as lastSeenAt"), "name", "mobile", "id")
                .from("devices")
                .where({owner: user})
                .asCallback(function(err, res){
                    if(err)cb(err);
                    else{
                        async.forEach(res, function(device, callback){
                            device.online = app.deviceClients[device.id] != null;
                            callback();
                        }, function(err){
                            cb(err, res);
                        });
                    }
                })
        },
        getDeviceInfo: function(device, cb){
            knex.select("*").from("devices").where({id: device}).limit(1).asCallback(cb);
        },
        getShuffleQueue: function(user, cb){
            knex.select("songs.id as id", "artists.id AS artistID", "songs.title AS title", "artists.name AS artist", "songs.album",
                        knex.raw("(SELECT COUNT(*) FROM votes WHERE up = 1 AND owner = ? AND song = songs.id) AS weight", user))
                .from("songs")
                .whereNotIn("songs.id", knex.select("song").from("plays").where({user: user}).andWhereRaw("`timestamp` > DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)"))
                .innerJoin("artists", "songs.artist", "artists.id")
                .orderByRaw("-LOG(1.0 - RAND()) / (weight+1/5)")
                .limit(10).asCallback(cb);
        }
    };

    return object;
};