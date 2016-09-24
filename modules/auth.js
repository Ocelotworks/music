/*
* Copyright 2016 Ocelotworks
 */


var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy.Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('config');

module.exports = function(app){
    app.passport = require('passport');


    app.passport.serializeUser(function(user, done) {
        console.log("Attempting to serialise");
        console.log(user);
        done(null, user.id);
    });

    app.passport.deserializeUser(function(id, done) {
        app.database.getUserInfo(id, done);
    });

    var baseURL = config.get("General.baseURL");
    var keys = config.get("Keys");

    app.passport.use(new GoogleStrategy({
        clientID: keys.get("Google.clientID"),
        clientSecret: keys.get("Google.clientSecret"),
        callbackURL: baseURL+"auth/google/callback"
    }, function(accessToken, refreshToken, profile, cb){
        app.database.getOrCreateUser(profile.id, profile.displayName, profile.photos[0] ? profile.photos[0].value : "https://placekitten.com/32/32", "GOOGLE", cb);
    }));

    app.passport.use(new TwitterStrategy({
        consumerKey: keys.get("Twitter.consumerKey"),
        consumerSecret: keys.get("Twitter.consumerSecret"),
        callbackURL: baseURL+"auth/twitter/callback"
    }, function(token, tokenSecret, profile, cb){
        console.log(profile);
        app.database.getOrCreateUser(profile.id, profile.displayName, profile.photos[0] ? profile.photos[0].value : "https://placekitten.com/32/32", "GOOGLE", cb);
    }));




    var obj = {

    };

    return obj;
};