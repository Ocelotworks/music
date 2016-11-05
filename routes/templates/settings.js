/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){

    router.get('/', function(req, res){
        if(!req.user){
            res.header(401);
        }else{
            //app.database.getSettingsForUser(req.user.id, function(err, data){
                res.render('templates/modals/settings', {layout: false, settings: req.user});
            //});

        }
    });

    router.get('/getApiKey', function(req, res){
        if(req.user){
            app.database.getApiKeyFromUser(req.user.id, function(err, data){
                res.json(data[0]);
            });
        }else{
            res.header(401);
        }
    });

    router.get('/generateAPIKey', function(req, res){
        if(!req.user){
            res.header(403).json({err: "You need to be signed in to do that."});
        }else{
            app.database.generateApiKey(req.user.id, function(err, key){
                if(err){
                    app.warn("Error generating API key: "+err);
                    res.header(500).json({err: err});
                }else{
                    res.json({key: key});
                }
            });
        }
    });

    return router;
};