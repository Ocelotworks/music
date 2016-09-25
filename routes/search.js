/*
* Copyright 2016 Ocelotworks
 */


var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/query/:query', function(req, res){
       app.database.search(req.params.query, function(err, resp){
          if(err){
              res.status(500).json({err: err});
          } else{
              res.send(resp);
          }
       });
    });


    router.get('/template/:query', function(req, res){
        app.database.search(req.params.query, function(err, resp){
            if(err){
                app.renderError(err, res);
            } else{
                res.render('templates/songList', {
                    songs: resp,
                    layout: false
                });
            }
        });
    });

  return router;
};
