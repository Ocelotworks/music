/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){


    router.use(function(req, res, next){
        if(!req.user){
            app.renderError({status: 401, message: "Authentication Required"}, res);
        }else{
            if(req.user.userlevel >=2){
                next();
            } else{
                app.renderError({status: 403, message: "Forbidden", stack: "UserLevel: "+req.user.userlevel+" Required: 2"}, res);
            }
        }
    });

    router.get('/', function(req, res){
        res.render('templates/admin', {layout: false});
    });

    router.get('/alerts', function(req, res){
        res.render('templates/admin/alerts', {layout: false, onlineUsers: app.expressWs.getWss('/ws/updates/').clients});
    });

    return router;
};