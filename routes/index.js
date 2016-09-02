var express = require('express');
var router = express.Router();




module.exports = function(app){


    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('index', {title: "Petify"});
        //app.database.getSongList(function(err, songs){
        //    if(err){
        //        app.renderError(err, res);
        //    }else{
        //        console.log(songs);
        //
        //    }
        //});

    });

    return router;
};

