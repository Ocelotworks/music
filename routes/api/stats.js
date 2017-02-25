/**
 * Created by Peter on 18/01/2017.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/stats/
module.exports = function(app){

    router.petifyInfo = {
        name: "Stats API",
        route: "/api/stats"
    };


    /**
     * /api/stats/plays
     */
    router.get('/plays', function(req, res){
        app.database.getSongPlaysStats(function(err, data) {
            if (err) {
                app.warn("Error processing song info request: "+err);
                res.status(500).json({err: err});
            } else {
                res.json(data);
            }
        });
    });

    return router;
};