/*
* Copyright 2016 Ocelotworks
 */

const express = require('express');
const router = express.Router();
const base = require('config').get("General.baseURL");

module.exports = function(app){


    const correctLogin = function(req, res){
        app.log(req.user.username+" logged in");
        res.redirect(base);
    };


    const options = {
        failureRedirect: '/?loginFail'
    };


    router.get('/logout', function(req, res){
        if(req.user){
            app.log(req.user.id+" logged out");
            req.logout();
            //TODO: Purge devices for this user here
        }
        res.redirect(base);
    });

    //Google Auth routes
    router.get('/google', app.passport.authenticate('google', {scope: ['profile']}));
    router.get('/google/callback', app.passport.authenticate('google', options), correctLogin);

    //Twitter Auth routes
    router.get('/twitter', app.passport.authenticate('twitter'));
    router.get('/twitter/callback', app.passport.authenticate('twitter', options), correctLogin);



    ////Facebook Auth routes
    //router.get('/facebook', app.passport.authenticate('facebook'));
    //router.get('/auth/facebook/callback', app.passport.authenticate('facebook', options, correctLogin));

    return router;
};