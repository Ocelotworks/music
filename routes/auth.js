/*
* Copyright 2016 Ocelotworks
 */

var express = require('express');
var router = express.Router();

module.exports = function(app){


    var correctLogin = function(req, res){
        console.log("Login success");
        console.log(req.user);
        res.redirect('/');
    };

    var options = {
        failureRedirect: '/?loginFail'
    };


    router.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
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