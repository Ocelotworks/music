/**
 * Created by Peter on 25/02/2017.
 */

var express = require('express');
var router = express.Router();

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
    router.put(['/clearFailed', '/:key/clearFailed'], app.util.validateKeyAbove(0), function(req, res){
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
    router.put(['/:id/retry', '/:key/:id/retry'], app.util.validateKeyAbove(0), function(req, res){
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
    router.put(['/:id/delete', '/:key/:id/delete'], app.util.validateKeyAbove(0), function(req, res){
        app.database.removeQueuedSong(req.params.id, function(err){
            if(err)
                res.json(err);
            else
                res.send("");
        });
    });


    return router;
};