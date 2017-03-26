/*
* Copyright Ocelotworks 2016
 */

var config  = require('config').get("Database");

if(config.pool){
    config.pool.afterCreate = function(conn, done){
        conn.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci', done);
    }
}

var knex    = require('knex')(config);
var uuid    = require('uuid').v4;
var async   = require('async');

/**
 * @name database
 * @param app
 * @returns {{name: string, init: init, getKnex: getKnex, addSong: addSong, getAllSongs: getAllSongs, getAllArtists: getAllArtists, getAllAlbums: getAllAlbums, getAllGenres: getAllGenres, getSongsByArtist: getSongsByArtist, getSongsByAlbum: getSongsByAlbum, getSongsByGenre: getSongsByGenre, getSongList: getSongList, getSongInfo: getSongInfo, getSongOwner: getSongOwner, deleteSong: deleteSong, cleanupAll: cleanupAll, cleanupAlbums: cleanupAlbums, cleanupPlaylists: cleanupPlaylists, cleanupArtists: cleanupArtists, cleanupGenres: cleanupGenres, getSongPathToPlay: getSongPathToPlay, addPlayForSong: addPlayForSong, addSkipForSong: addSkipForSong, getArtistFromSong: getArtistFromSong, getArtistFromId: getArtistFromId, getArtistImage: getArtistImage, getArtistsWithNoImage: getArtistsWithNoImage, getArtistName: getArtistName, updateArtistImage: updateArtistImage, getSongsFromArtist: getSongsFromArtist, getOrCreateArtist: getOrCreateArtist, getOrCreateAlbum: getOrCreateAlbum, updateAlbumArt: updateAlbumArt, getAlbumArt: getAlbumArt, getAlbumInfo: getAlbum, getAlbumsWithNoImage: getAlbumsWithNoImage, getOrCreateGenre: getOrCreateGenre, getGenreArt: getGenreArt, getSongQueue: getSongQueue, getQueuedSong: getQueuedSong, resetSongQueue: resetSongQueue, removeQueuedSong: removeQueuedSong, updateQueuedSong: updateQueuedSong, addSongToQueue: addSongToQueue, getOrCreateUser: getOrCreateUser, getUserInfo: getUserInfo, searchSongs: searchSongs, searchArtists: searchArtists, searchAlbums: searchAlbums, searchGenres: searchGenres, createPlaylist: createPlaylist, deletePlaylist: deletePlaylist, getPublicPlaylists: getPublicPlaylists, canUserEditPlaylist: canUserEditPlaylist, getPrivatePlaylists: getPrivatePlaylists, getOwnedPlaylists: getOwnedPlaylists, getPlaylistInfo: getPlaylistInfo, getSongsByPlaylist: getSongsByPlaylist, getPlaylistsBySong: getPlaylistsBySong, addSongToPlaylist: addSongToPlaylist, getSongExists: getSongExists, getDetailedSongInfo: getDetailedSongInfo, generateApiKey: generateApiLey, getApiKeyFromUser: getApiKeyFromUser, getUserFromApiKey: getUserFromApiKey, addSongVote: addSongVote, getAlbumArtForGenreImage: getAlbumArtForGenreImage, putGenreImage: putGenreImage, logError: logError, clearFailedDownloads: clearFailedDownloads, getMostPlayedStats: getMostPlayedStats, getMostPopularStats: getMostPopularStats, getOverallStats: getOverallStats, getMostSkippedStats: getMostSkippedStats, doesSongExist: doesSongExist, getQueuedSongInfo: getQueuedSongInfo, addDevice: addDevice, updateDeviceLastSeen: updateDeviceLastSeen, getDevicesByUser: getDevicesByUser, getDevicesForSettings: getDevicesForSettings, getDeviceInfo: getDeviceInfo, getShuffleQueue: getShuffleQueue, getUserHistory: getUserHistory, getSongPlaysStats: getSongPlaysStats}}
 */
module.exports = function database(app){
    /**
     * Database object
     * @memberof database
     * @namespace app.database
     * @type {{name: string, init: init, getKnex: getKnex, addSong: addSong, getAllSongs: getAllSongs, getAllArtists: getAllArtists, getAllAlbums: getAllAlbums, getAllGenres: getAllGenres, getSongsByArtist: getSongsByArtist, getSongsByAlbum: getSongsByAlbum, getSongsByGenre: getSongsByGenre, getSongList: getSongList, getSongInfo: getSongInfo, getSongOwner: getSongOwner, deleteSong: deleteSong, cleanupAll: cleanupAll, cleanupAlbums: cleanupAlbums, cleanupPlaylists: cleanupPlaylists, cleanupArtists: cleanupArtists, cleanupGenres: cleanupGenres, getSongPathToPlay: getSongPathToPlay, addPlayForSong: addPlayForSong, addSkipForSong: addSkipForSong, getArtistFromSong: getArtistFromSong, getArtistFromId: getArtistFromId, getArtistImage: getArtistImage, getArtistsWithNoImage: getArtistsWithNoImage, getArtistName: getArtistName, updateArtistImage: updateArtistImage, getSongsFromArtist: getSongsFromArtist, getOrCreateArtist: getOrCreateArtist, getOrCreateAlbum: getOrCreateAlbum, updateAlbumArt: updateAlbumArt, getAlbumArt: getAlbumArt, getAlbumInfo: getAlbum, getAlbumsWithNoImage: getAlbumsWithNoImage, getOrCreateGenre: getOrCreateGenre, getGenreArt: getGenreArt, getSongQueue: getSongQueue, getQueuedSong: getQueuedSong, resetSongQueue: resetSongQueue, removeQueuedSong: removeQueuedSong, updateQueuedSong: updateQueuedSong, addSongToQueue: addSongToQueue, getOrCreateUser: getOrCreateUser, getUserInfo: getUserInfo, searchSongs: searchSongs, searchArtists: searchArtists, searchAlbums: searchAlbums, searchGenres: searchGenres, createPlaylist: createPlaylist, deletePlaylist: deletePlaylist, getPublicPlaylists: getPublicPlaylists, canUserEditPlaylist: canUserEditPlaylist, getPrivatePlaylists: getPrivatePlaylists, getOwnedPlaylists: getOwnedPlaylists, getPlaylistInfo: getPlaylistInfo, getSongsByPlaylist: getSongsByPlaylist, getPlaylistsBySong: getPlaylistsBySong, addSongToPlaylist: addSongToPlaylist, getSongExists: getSongExists, getDetailedSongInfo: getDetailedSongInfo, generateApiKey: generateApiLey, getApiKeyFromUser: getApiKeyFromUser, getUserFromApiKey: getUserFromApiKey, addSongVote: addSongVote, getAlbumArtForGenreImage: getAlbumArtForGenreImage, putGenreImage: putGenreImage, logError: logError, clearFailedDownloads: clearFailedDownloads, getMostPlayedStats: getMostPlayedStats, getMostPopularStats: getMostPopularStats, getOverallStats: getOverallStats, getMostSkippedStats: getMostSkippedStats, doesSongExist: doesSongExist, getQueuedSongInfo: getQueuedSongInfo, addDevice: addDevice, updateDeviceLastSeen: updateDeviceLastSeen, getDevicesByUser: getDevicesByUser, getDevicesForSettings: getDevicesForSettings, getDeviceInfo: getDeviceInfo, getShuffleQueue: getShuffleQueue, getUserHistory: getUserHistory, getSongPlaysStats: getSongPlaysStats}}
     */
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
         * @name addSong
         * @param {string} song - A song object, containing the mandatory fields at minimum (See the database structure)
         * @param {function} cb - A callback, returning err as the first argument if the insert failed.
         */
        addSong: function addSong(song, cb){
            knex("songs").insert(song).asCallback(cb);
        },
        /**
         * Update a song's info
         * @param {string} song The song UUID
         * @param {object} data The data to change
         * @param {function} cb
         */
        updateSong: function updateSong(song, data, cb){
            knex("songs").update(data).where({id: song}).asCallback(cb);
        },
        /**
         * Gets every song in order
         * @param {function} cb
         */
        getAllSongs: function getAllSongs(cb){
            knex.select().from("songs").orderBy("artist", "desc").asCallback(cb);
        },
        /**
         * Gets every artist in name order
         * @param {function} cb
         */
        getAllArtists: function getAllArtists(cb){
            knex.select("name", "id").from("artists").distinct("name").orderBy("name", "asc").asCallback(cb);
        },
        /**
         * Gets every album in name order
         * @param {function} cb
         */
        getAllAlbums: function getAllAlbums(cb){
            knex.select("name", "id").from("albums").distinct("name").orderBy("name", "desc").asCallback(cb);
        },
        /**
         * Gets every genre in name order
         * @param {function} cb
         */
        getAllGenres: function getAllGenres(cb){
            knex.select("name", "id").from("genres").distinct("name").orderBy("name", "desc").asCallback(cb);
        },
        /**
         * Gets every song by a specific artist ID
         * @param artist - the UUID of the artist
         * @param {function} cb
         */
        getSongsByArtist: function getSongsByArtist(artist, cb){
            knex.select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album")
                .from("songs")
                .where({artist: artist})
                .innerJoin("artists", "songs.artist", "artists.id")
                .asCallback(cb);
        },
        /**
         * Gets every song by a specific album ID
         * @param {string} album - the UUID of the album
         * @param {function} cb
         */
        getSongsByAlbum: function getSongsByAlbum(album, cb){
            knex.select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album")
                .from("songs")
                .where({album: album})
                .innerJoin("artists", "songs.artist", "artists.id").asCallback(cb);
        },
        /**
         * Gets every song by a specific genre ID
         * @param {string} genre - the UUID of the genre
         * @param {function} cb
         */
        getSongsByGenre: function getSongsByGenre(genre, cb){
            knex.select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album")
                .from("songs")
                .where({genre: genre})
                .innerJoin("artists", "songs.artist", "artists.id")
                .asCallback(cb);
        },
        /**
         * Gets every song that has an invalid length
         * @param cb
         */
        getSongsWithNoLength: function getSongsWithNoLength(cb){
           knex.select("id", "path").from("songs").where({duration: 0}).asCallback(cb);
        },

        getSongsWithUnknownAlbum: function getSongsWithUnknownAlbum(cb){
          knex.select("songs.id")
              .from("songs")
              .where({"albums.name": "Unknown Album"})
              .innerJoin("albums", "albums.id", "songs.album")
              .asCallback(cb);
        },
        /**
         * Gets a list of songs, including artist and album name, sorted by artist
         * @param {integer} offset
         * @param {function} cb
         */
        getSongList: function getSongList(offset, cb){
            knex.from("songs")
                .innerJoin("artists", "songs.artist", "artists.id")
                .select("songs.id AS song_id", "artists.id AS artist_id", "artists.name", "songs.title", "songs.album")
                .orderBy("artists.name", "ASC")
                .limit(100)
                .offset(parseInt(offset))
                .asCallback(cb);
        },
        /**
         * Gets information about a certain song
         * @param {string} id The song UUID
         * @param {function} cb
         */
        getSongInfo: function getSongInfo(id, cb){
            knex.select("*").from("songs").where({id: id}).asCallback(cb);
        },
        /**
         * Returns the UUID of the user who added a song
         * @param {string} id The song UUID
         * @param {function} cb function(err, userID)
         */
        getSongOwner: function getSongOwner(id, cb){
            knex.select("addedby").from("songs").where({id: id}).limit(1).asCallback(function getSongOwnerCB(err, resp){
               cb(err, resp ? resp[0].addedby : null);
            });
        },
        /**
         * Deletes a song, and triggers cleanup
         * @param {string} id The song UUID
         * @param {function} cb function(err)
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
         * @param {function} cb
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
         * @param {function} cb
         */
        cleanupAlbums: function cleanupAlbums(cb){
            knex.delete()
                .from("albums")
                .whereNotIn("id", knex.select("album").from("songs")).asCallback(cb);
        },
        /**
         * Removes all orphaned playlist data
         * @param {function} cb
         */
        cleanupPlaylists: function cleanupPlaylists(cb){
            knex.delete()
                .from("playlist_data")
                .whereNotIn('song_id', knex.select("id").from("songs").whereRaw("id = playlist_data.song_id")).asCallback(cb);

        },
        /**
         * Removes all orphaned artists (excluding Louis Armstrong)
         * @param {function} cb
         */
        cleanupArtists: function cleanupArtists(cb){
            knex.delete()
                .from("artists")
                .whereNotIn("id", knex.select("artist").from("songs")).asCallback(cb);
        },
        /**
         * Removes all orphaned genres
         * @param {function} cb
         */
        cleanupGenres: function cleanupGenres(cb){
            knex.delete()
                .from("genres")
                .whereNotIn("id", knex.select("genre").from("songs")).asCallback(cb);
        },
        /**
         * Gets the path of a song, and logs the play
         * @param {string} id the song UUID
         * @param {string} userid the UUID of the user playing the song
         * @param {function} cb function(err, path)
         */
        getSongPathToPlay: function getSongPathToPlay(id, userid, cb){
            knex.select("path").from("songs").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Register a song being played
         * @param {string} id The UUID of the song being played
         * @param {string} userid The UUID of the user that played the song
         * @param {boolean} manual Whether or not the song was played manually or via the shuffle queue
         * @param {function} cb
         */
        addPlayForSong: function addPlayForSong(id, userid, manual, cb){
            knex("plays").insert({
                user: userid,
                song: id,
                manual: manual ? 1 : 0
            }).asCallback(function getSongPathToPlayCB(err){
                if(err)
                    app.warn("Error adding play for song "+id+": "+err);
            });
        },
        /**
         * Adds a skip for a song for a specific user
         * @param {string} id The song ID
         * @param {string} userid The user ID
         * @param {integer} seconds The amount of seconds into the song that they skipped
         * @param {function} cb
         */
        addSkipForSong: function addSkipForSong(id, userid, seconds, cb){
            knex("skips").insert({
                user: userid,
                song: id,
                seconds: seconds
            }).asCallback(cb);
        },
        /**
         * Gets the artist name from a song ID
         * @param {string} song the song ID
         * @param {function} cb
         */
        getArtistFromSong: function getArtistFromSong(song, cb){
            knex.select("name", "id").from("artists").where({id: knex.select("artist").from("songs").where({id: song})}).asCallback(cb);
        },
        /**
         * Get artist info
         * @param {string} id Artist UUID
         * @param {function} cb
         */
        getArtistFromId: function getArtistFromId(id, cb){
            knex.select().from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Get the image blob from an artist ID
         * @param {string} id Artist UUID
         * @param {function} cb
         */
        getArtistImage: function getArtistImage(id, cb){
            knex.select("image").from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Gets all the artists that are missing an image
         * @param {function} cb
         */
        getArtistsWithNoImage: function getArtistsWithNoImage(cb){
            knex.select("id").from("artists").whereNull("image").asCallback(cb);
        },
        /**
         * Gets an artists name from their ID
         * @param {string} id Artist UUID
         * @param {function} cb
         */
        getArtistName: function getArtistName(id, cb){
            knex.select("name").from("artists").where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Updates an artists image
         * @param {string} id Artist UUID
         * @param {binary} image Image blob
         * @param {function} cb
         */
        updateArtistImage: function updateArtistImage(id, image, cb){
            knex("artists").update({image: image}).where({id: id}).limit(1).asCallback(cb);
        },
        /**
         * Gets the songs from an artist TODO: Is this a duplicate of getSongsByArtist?
         * @see getSongsByArtist
         * @param {string} artist Artist UUID
         * @param {function} cb
         */
        getSongsFromArtist: function getSongsFromArtist(artist, cb){
            knex.select("uuid", "artist", "album", "plays", "genre", "duration").from("songs").where({artist: artist}).asCallback(cb);
        },
        /**
         * Attempts to find an artist with the name provided, if none is found, creates a new artist
         * @param {string} artist Artist UUID
         * @param {function} cb
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
         * @param {string} album Album Name
         * @param {string} artist Artist UUID
         * @param {function} cb
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
         * @param {string} album Album UUID
         * @param {binary} blob A binary blob of the album art
         * @param {function} cb
         */
        updateAlbumArt: function updateAlbumArt(album, blob, cb){
          knex("albums").update({image: blob}).where({id: album}).asCallback(cb);
        },
        /**
         * Gets the album art from an album
         * @param {string} album Album UUID
         * @param {function} cb function(err, blob)
         */
        getAlbumArt: function getAlbumArt(album, cb){
            knex.select("image").from("albums").where({id: album}).limit(1).asCallback(cb);
        },
        /**
         * Returns the album with the specified UUID
         * @param {string} album Album UUID
         * @param {function} cb
         */
        getAlbumInfo: function getAlbum(album, cb){
            knex.select("albums.id", "albums.artist", "albums.name AS albumName", "artists.name AS artistName")
                .from("albums")
                .where({"albums.id": album})
                .limit(1)
                .innerJoin("artists", "albums.artist", "artists.id")
                .asCallback(cb);
        },
        /**
         * Gets all albums with no album art
         * @param {function} cb
         */
        getAlbumsWithNoImage: function getAlbumsWithNoImage(cb){
            knex.select("id")
                .from("albums")
                .whereNull("image")
                .asCallback(cb);
        },
        /**
         * Tries to find a specific genre, if none is found, creates a new genre
         * @param {string} genre Genre Name
         * @param {function} cb
         */
        getOrCreateGenre: function getOrCreateGenre(genre, cb){
            knex.raw("select `id`, image IS NULL as needsImage from `genres` where `name` = '"+genre+"' LIMIT 1").asCallback(function getOrCreateGenre(err, res){ //DANGER!
                if(err)
                    cb(err);
                else{
                    res = res[0];
                    if(res[0] && res[0].id){
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
         * @param {string} genre Genre UUID
         * @param {function} cb
         */
        getGenreArt: function getGenreArt(genre, cb){
            knex.select("image").from("genres").where({id: genre}).limit(1).asCallback(cb);
        },
        /**
         * Gets the songs currently queued for download
         * @param {function} cb
         */
        getSongQueue: function getSongQueue(cb){
            knex.select().from("queue").innerJoin("artists", "queue.artist", "artists.id").innerJoin("users", "queue.addedby", "users.id").orderBy("queue.id", "DESC").asCallback(cb);
        },
        /**
         * Gets the next song to download
         * @param {function} cb
         */
        getQueuedSong: function getQueuedSong(cb){
          knex.select().from("queue").whereNot({status: 'FAILED'}).andWhereNot({status: 'DUPLICATE'}).andWhereNot({status: 'PROCESSING'}).limit(1).asCallback(cb);
        },
        /**
         * Changes all "PROCESSING" songs to "WAITING" after a server restart
         * @param {function} cb
         */
        resetSongQueue: function resetSongQueue(cb){
            knex("queue").update({status: 'WAITING'}).where({status: 'PROCESSING'}).asCallback(cb);
        },
        /**
         * Removes a song from the download queue
         * @param {string} id The ID of the queued item
         * @param {function} cb
         */
        removeQueuedSong: function removeQueuedSong(id, cb){
          knex("queue").where({id: id}).delete().asCallback(cb);
        },
        /**
         * Update the status of a queued download
         * @param {string} id the ID of the queued item
         * @param update the new status (FAILED,PROCESSING,DONE)
         * @param {function} cb
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
         * @param playlist The playlist UUID to add the song to after it's done
         * @param {function} cb
         */
        addSongToQueue: function addSongToQueue(url, destination, addedby, artist, title, album, playlist, cb){
            function exec(url, destination, addedById, artistId, title, albumId){
                knex("queue").insert({
                    url: url,
                    destination: destination,
                    addedby: addedById,
                    artist: artistId,
                    title: title,
                    album: albumId,
                    playlist: playlist
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
         * @param {string} identifier The token from the oauth
         * @param {string} username The username
         * @param {string} avatar The avatar URL
         * @param {enum} strategy The login strategy used (TWITTER,GOOGLE,BOT if it is a manually added account)
         * @param {function} cb
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
         * @param {string} id User UUID
         * @param {function} cb
         */
        getUserInfo: function getUserInfo(id, cb){
            knex.select().from("users").where({id: id}).limit(1).asCallback(function getUserInfoCB(err, res){
                if(res[0])cb(err, res[0]);
                else cb(err, null);
            });
        },
        /**
         * Search for songs
         * @param {string} query Search Query
         * @param {function} cb
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
         * @param {string} query Search Query
         * @param {function} cb
         */
        searchArtists: function searchArtists(query, cb){
            knex.select("name", "id")
                .from("artists")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Search for albums
         * @param {string} query Search Query
         * @param {function} cb
         */
        searchAlbums: function searchAlbums(query, cb){
            knex.select("name", "id")
                .from("albums")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },
        /**
         * Search for genres
         * @param {string} query Search Query
         * @param {function} cb
         */
        searchGenres: function searchGenres(query, cb){
            knex.select("name", "id")
                .from("genres")
                .where(knex.raw("MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)", query))
                .asCallback(cb);
        },

        /**
         * Create a playlist
         * @param {object} playlist The playlist object, as defined by the form in templates.js
         * @see templates.js
         * @param {function} cb
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
         * @param {string} id Playlist UUID
         * @param {function} cb
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
          * @param {function} cb
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
         * @param {string} id Playlist UUID
         * @param {string} user User UUID
         * @param {function} cb function(err, canEdit)
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
         * @param {string} id User UUID
         * @param {function} cb
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
         * @param {string} id User UUID
         * @param {function} cb
         */
        getOwnedPlaylists: function getOwnedPlaylists(id, cb){
            knex.select("name", "private", "playlists.id AS id")
                .from("playlists")
                .where("owner", id)
                .asCallback(cb);
        },
        /**
         * Get information about a certain playlist
         * @param {string} id Playlist UUID
         * @param {function} cb
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
         * @param {string} id Playlist UUID
         * @param {function} cb
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
         * @param {string} id Song UUID
         * @param {string} user User UUID
         * @param {function} cb
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
         * @param {string} id
         * @param {function} cb function(err, exists)
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
         * @param {string} id The song UUID
         * @param {function} cb
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
         * @param {string} id The UUID of the user to assign to the key
         * @param {function} cb
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
         * @param {string} id The user UUID
         * @param {function} cb
         */
        getApiKeyFromUser: function getApiKeyFromUser(id, cb){
            knex.select("id").from("api_keys").where({owner: id, revoked: 0}).limit(1).asCallback(cb);
        },
        /**
         * Get the user that owns a certain API key, ONLY if the API key is not revoked
         * @param {string} key The API key
         * @param {function} cb
         */
        getUserFromApiKey: function getUserFromApiKey(key, cb){
            knex.select("users.*").innerJoin("users", "api_keys.owner", "users.id").from("api_keys").where({"api_keys.id": key, revoked: 0}).limit(1).asCallback(cb);
        },
        /**
         * Adds a vote for a song
         * @param {string} song The UUID of the song
         * @param {string} user The UUID of the user
         * @param {boolean} up true if upvote, false if downvote
         * @param {function} cb function(err)
         */
        addSongVote: function addSongVote(song, user, up, cb){
            knex("votes").insert({
                owner: user,
                song: song,
                up: up ? 1 : 0
            }).asCallback(cb);
        },
        /**
         * Gets the users current vote for a song
         * @param {string} song
         * @param {string} user
         * @param {function} cb
         */
        getCurrentSongVote: function getCurrentSongVote(song, user, cb){
            knex.select("up")
                .from("votes")
                .where({
                    song: song,
                    owner: user
                })
                .limit(1)
                .asCallback(cb);
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
         * @param {enum} type ENUM('PAGE_ERROR','APP_ERROR','DATABASE_ERROR','SECURITY','OTHER')
         * @param {string} detail MAX 128 CHARS
         * @param {string} trace MAX 128 CHARS
         * @param {function} cb function(err)
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
         * @param {function} cb function(err)
         */
        clearFailedDownloads: function clearFailedDownloads(cb){
            knex("queue").delete().where({status: 'FAILED'}).asCallback(cb);
        },
        /**
         * Gets the amount of times a song has been played
         * @param {string} song
         * @param {function} cb
         */
        getSongPlays: function getSongPlays(song, cb){
            knex.select(knex.raw("COUNT(*) AS plays")).from("plays").where({song: song}).asCallback(cb);
        },
        /**
         * Returns a table of total plays, title, artist, minutes listened, sorted by plays
         * @param {function} cb
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
        /**
         * Gets the most popular songs based on the amount of votes they get
         * @param {function} cb
         */
        getMostPopularStats: function getMostPopularStats(cb){
            knex.select("artists.name", "songs.title", knex.raw("SUM(up)"))
                .from("votes")
                .innerJoin("songs", "votes.song", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .groupBy("song")
                .orderByRaw("SUM(UP) DESC")
                .limit(10)
                .asCallback(cb);
        },
        getOverallStats: function getOverallStats(cb){
            knex.select(knex.raw("SUM(songs.duration) AS seconds"), knex.raw("COUNT(*) as total"), knex.raw("(SELECT AVG(duration) FROM songs) AS averageDuration"))
                .from("plays")
                .innerJoin("songs", "plays.song", "songs.id")
                .asCallback(cb);
        },
        getMostSkippedStats: function getMostSkippedStats(cb){
            knex.select("artists.name AS artist", "songs.title AS title", knex.raw("COUNT(*) as timesSkipped"), knex.raw("AVG(seconds) as averageSkip"), knex.raw(" (AVG(seconds)/duration)*100 as percentage"))
                .from("skips")
                .innerJoin("songs", "skips.song", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .groupBy("song")
                .orderByRaw("COUNT(*) DESC,AVG(seconds) ASC")
                .limit(10)
                .asCallback(cb);
        },
        /**
         * Checks if a song with artist artistName and song songName exists already
         * @param {string} artistName The exact name of the artist to look up
         * @param {string} songName The exact name of the song to look up
         * @param {function} cb function(err, exists)
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
        /**
         * Returns a queued song from its id
         * @param {string} id The queued song ID
         * @param {function} cb
         */
        getQueuedSongInfo: function getQueuedSongInfo(id, cb){
            knex.select("*")
                .from("queue")
                .where({id: id})
                .limit(1)
                .asCallback(cb);
        },
        /**
         * Add a device
         * @param {object} device
         * @param {function} cb
         */
        addDevice: function addDevice(device, cb){
            knex("devices").insert(device).asCallback(cb);
        },
        /**
         * Change a devices last seen time to right now
         * @param {string} device Device UUID
         * @param {function} cb
         */
        updateDeviceLastSeen: function updateDeviceLastSeen(device, cb){
            knex("devices").update({lastSeen: knex.raw("CURRENT_TIMESTAMP()")}).where({id: device}).limit(1).asCallback(cb);
        },
        /**
         * Get's a users device list
         * @param {string} user User UUID
         * @param {function} cb
         */
        getDevicesByUser: function getDevicesByUser(user, cb){
            knex.select("*").from("devices").where({owner: user}).asCallback(cb);
        },
        /**
         * Get a devices info along with the time difference since it was last seen
         * @param {string} user User UUID
         * @param {function} cb
         */
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
        /**
         * Get a device from it's UUID
         * @param {string} device Device UUID
         * @param {function} cb
         */
        getDeviceInfo: function(device, cb){
            knex.select("*").from("devices").where({id: device}).limit(1).asCallback(cb);
        },
        /**
         * Generate a shuffle queue for a user
         * @param {string} user User UUID
         * @param {function} cb
         */
        getShuffleQueue: function(user, cb){
            knex.select("songs.id as id", "artists.id AS artistID", "songs.title AS title", "artists.name AS artist", "songs.album",
                        knex.raw("(SELECT COUNT(*) FROM votes WHERE up = 1 AND owner = ? AND song = songs.id) AS weight", user))
                .from("songs")
                .whereNotIn("songs.id",
                    knex.select("song")
                        .from("plays")
                        .where({user: user})
                        .andWhereRaw("`timestamp` > DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)"))
                .whereNotIn("songs.id",
                    knex.select("song")
                    .from("votes")
                    .where({up: 0, owner: user}))
                .innerJoin("artists", "songs.artist", "artists.id")
                .orderByRaw("-LOG(1.0 - RAND()) / (weight+1/5)")
                .limit(10)
                .asCallback(cb);
        },
        /**
         * Get the user's actions, in reverse order
         * @param user The user ID
         * @param page The page (set of 100 records) to get
         * @param {function} cb callback
         */
        getUserHistory: function(user, page, cb){
            knex.select("votes.timestamp AS time", "artists.name AS artist", "songs.title AS song", knex.raw('CASE WHEN up THEN (SELECT "Vote Up") ELSE (SELECT "Vote Down") END as type'))
                .from("votes")
                .innerJoin("songs", "votes.song", "songs.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .where({owner: user})
                .unionAll(function(){
                    this.select("plays.timestamp AS time", "artists.name AS artist", "songs.title AS song", knex.raw('(SELECT "Listen") AS type'))
                        .from("plays")
                        .innerJoin("songs", "plays.song", "songs.id")
                        .innerJoin("artists", "songs.artist", "artists.id")
                        .where({user: user});
                })
                .orderBy("time", "DESC")
                .limit(100)
                .asCallback(cb);
        },
        /**
         * Get most played songs
         * @param {function} cb
         */
        getSongPlaysStats: function getSongPlaysStats(cb){
            knex.select(knex.raw("COUNT(*) AS y"), knex.raw("DATE(timestamp) AS x"))
                .from("plays")
                .groupByRaw("DATE(timestamp)")
                .asCallback(cb);
        },
        mergeGenres: function mergeGenres(genre, cb){
            knex("songs")
                .update({genre: genre})
                .whereIn("genre",
                    knex.select("id")
                        .from("genres")
                        .where({
                            name: knex.select("name")
                                    .from("genres")
                                    .where({id: genre})
                        }))
                .asCallback(cb);
        },
        getGenresWithNoImage: function getGenresWtihNoImage(cb){
            knex.select("id").from("genres").whereNull("image").asCallback(cb);
        },
        getLatestSongs: function getLatestSongs(cb){
            knex.select("songs.id AS song_id",
                "albums.id AS album_id", "artists.id AS artist_id",
                "songs.title", "artists.name AS artist_name",
                "albums.name AS album_name")
                .from("songs")
                .innerJoin("albums", "songs.album", "albums.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .orderBy("timestamp", "DESC")
                .limit(7)
                .asCallback(cb);
        },
        getListenAgain: function getListenAgain(user, cb){
            knex.select("songs.id AS song_id",
                "albums.id AS album_id", "artists.id AS artist_id",
                "songs.title", "artists.name AS artist_name",
                "albums.name AS album_name")
                .from("plays")
                .innerJoin("songs", "plays.song", "songs.id")
                .innerJoin("albums", "songs.album", "albums.id")
                .innerJoin("artists", "songs.artist", "artists.id")
                .where({user: user, manual: 1})
                .whereNotNull("albums.image")
                .groupBy("songs.id")
                .orderByRaw("RAND()")
                .limit(7)
                .asCallback(cb);
        }
    };
    app.jobs.addJob("Create User", {
        desc: "Creates a new User",
        args: ["OAuth Identifier", "Username", "Avatar URL", "Stratedgy"],
        func: object.getOrCreateUser
    });

    app.jobs.addJob("Generate New API Key", {
        desc: "Generates a new API Key for the specified user, invalidating their old one.",
        args: ["User ID"],
        func: object.generateApiKey
    });

    app.jobs.addJob("Clear Failed Downloads", {
        desc: "Clears failed song downloads",
        args: [],
        func: object.clearFailedDownloads
    });

    app.jobs.addJob("Delete Playlist", {
        desc: "Deletes a specified playlist",
        args: ["Playlist ID"],
        func: object.deletePlaylist
    });

    app.jobs.addJob("Cleanup Genres", {
        desc: "Cleanup genres with no songs in",
        args: [],
        func: object.cleanupGenres
    });

    app.jobs.addJob("Cleanup Artists", {
        desc: "Cleanup artists with no songs",
        args: [],
        func: object.cleanupArtists
    });

    app.jobs.addJob("Cleanup Albums", {
        desc: "Cleanup albums with no songs in",
        args: [],
        func: object.cleanupAlbums
    });

    app.jobs.addJob("Cleanup Playlist Data", {
        desc: "Cleanup orphaned playlist data",
        args: [],
        func: object.cleanupPlaylists
    });

    app.jobs.addJob("Add Song", {
       desc: "Adds a song entry to the database",
       args: ["Artist ID", "Album ID", "Genre ID", "MBID", "Path", "Duration", "Title", "AddedBy"],
        func: object.addSong
    });

    app.jobs.addJob("Merge Genres", {
        desc: "Merge all genres of the same name with the specified genre ID",
        args: ["Genre ID"],
        func: object.mergeGenres
    });

    object.init();

    return object;
};