/**
 * Created by Peter on 25/02/2017.
 */

var express = require('express');
var router = express.Router();
var path = require('path');

// BASE+/api/downloader/
module.exports = function(app){
    /**
     * /downloader/queue
     */
    router.get('/queue', function(req, res){
        app.database.getSongQueue(function(err, queue) {
            if(err)res.json({err: err});
            else{
                res.json(queue);
            }
        });
    });

    /**
     * /downloader/clearFailed
     * /downloader/:key/clearFailed
     */
    router.get(['/clearFailed', '/:key/clearFailed'], app.util.validateKeyAbove(0), function(req, res){
        res.header(204).send("");
        app.database.clearFailedDownloads(function(err){
            if(err)
                app.error("Error clearing failed downloads: "+err);
        });
    });

    /**
     * /downloader/:id/retry
     * /downloader/:key/:id/retry
     */
    router.get(['/:id/retry', '/:key/:id/retry'], app.util.validateKeyAbove(0), function(req, res){
        app.database.updateQueuedSong(req.params.id, {status: 'WAITING'}, function(err){
           if(err)
               res.json(err);
           else
               res.send("");
        });
    });

    /**
     * /downloader/:id/delete
     * /downloader/:key/:id/delete
     */
    router.get(['/:id/delete', '/:key/:id/delete'], app.util.validateKeyAbove(0), function(req, res){
        app.database.removeQueuedSong(req.params.id, function(err){
            if(err)
                res.json(err);
            else
                res.send("");
        });
    });


    /**
     * /downloader/add
     * /downloader/:key/add
     */
    router.get(['/add', '/:key/add'], app.util.validateKeyAbove(0), function(req, res){
        if(req.body && req.body.url && req.body.songFolder){
            app.downloader.queue(req.body.url, path.join(config.get("baseDir"), req.body.songFolder), req.body.getLastfmData || false, req.user ? req.user.id : "c999f4ab-72a6-11e6-839f-00224dae0d2a");
            res.json({});
        }else{
            res.json({err: "A required piece of data is missing."});
        }
    });


    return router;
};