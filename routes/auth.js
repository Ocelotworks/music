/*
* Copyright 2016 Ocelotworks
 */

var express = require('express');
var router = express.Router();
var base = require('config').get("General.baseURL");

module.exports = function(app){


    var correctLogin = function(req, res){
        app.log(req.user.id+" logged in");

        res.redirect(base);
    };

    var options = {
        failureRedirect: '/?loginFail'
    };


    router.get('/logout', function(req, res){
        if(req.user){
            app.log(req.user.id+" logged out");
            req.logout();
        }
        res.redirect(base);
    });

    //Google Auth routes
    router.get('/google', app.passport.authenticate('google', {scope: ['profile']}));
    router.get('/google/callback', app.passport.authenticate('google', options), correctLogin);


    router.get('/twitter', app.passport.authenticate('twitter'));
    router.get('/twitter/callback', app.passport.authenticate('twitter', options), correctLogin);


    ////Facebook Auth routes
    //router.get('/facebook', app.passport.authenticate('facebook'));
    //router.get('/auth/facebook/callback', app.passport.authenticate('facebook', options, correctLogin));

    return router;
};