var express = require('express');
var router = express.Router();
var config = require('config');



module.exports = function(app){


    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', {title: "Petify", user: req.user, developmentMode: app.get('env') === 'development'});
    });


    router.get("/song/:id", function(req, res){
       app.database.getSongPath(req.params.id, function(err, resp){
           if(err){
               console.log(err);
               res.header(500).json(err);
           }else{
               if(resp.length > 0){
                   var path = resp[0].path;
                   res.sendFile(path);
               }else{
                   res.header(404).json({error: "Not Found"});
               }
           }
       });
    });

    router.get("/album/:id", function(req, res){
       app.database.getAlbumArt(req.params.id, function(err, resp){
           if(err || !resp[0] || !resp[0].image)
               res.redirect("../img/album.png");
           else{
               res.header('Content-Type', 'image/png');
               res.end(resp[0].image);
           }

       })
    });

    return router;
};

