/*
 * Copyright Ocelotworks 2016
 */

var express = require('express');
var router = express.Router();
const config = require('config');

module.exports = function(app){

    router.petifyInfo = {
        name: "Admin Templates",
        route: "/templates/admin"
    };

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
        res.render('templates/admin', {layout: false, uptime: process.uptime(), jobs: app.jobs.getJobNames()});
    });

    router.get('/settings', function(req, res){
        res.render('templates/admin/settings', {layout: false, settings: config});
    });

    router.get('/alerts', function(req, res){
        res.render('templates/admin/alerts', {layout: false, onlineUsers: app.expressWs.getWss('/ws/updates/').clients});
    });

    router.get('/routes', function(req, res){
       res.render('templates/admin/routes', {layout: false, routes: app.loadedRoutes});
    });

    router.get('/websocket', function(req, res){
        app.database.getDeviceSockets(function getDeviceSocketsCB(err, resp){
            if(err){
                app.error(`Error getting device sockets: ${err}`);
            }else{
                res.render('templates/admin/websocket', {layout: false, clients: resp, connectedClients: resp.length, sockets: app.deviceClients});
            }
        });

    });

    router.post('/alerts', function(req, res){
       if(!req.user || req.user.userlevel < 2){
           res.header(401).json({error: "You don't have permission to do that."});
       }else{
            if(!req.body || !req.body.title || !req.body.body){
                res.header(406).json({error: "A required field is missing."});
            }else{
                var message = {
                    lifetime: req.body.lifetime,
                    title: req.body.title,
                    body: req.body.body,
                    image: req.body.url || "img/album.png"
                };
                if(!req.body.users || req.body.users.length === 0 || !req.body.specificUsers){
                    app.broadcastUpdate("alert", message);
                }else{
                    var clients = app.expressWs.getWss('/ws/updates/').clients;
                    for(var i in req.body.users)
                        if(req.body.users.hasOwnProperty(i) && req.body.users[i] && clients[i])
                            clients[i].send(JSON.stringify({type: "alert", message: message}));
                }
                res.header(204);
            }
       }

    });

    return router;
};