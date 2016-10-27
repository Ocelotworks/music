/*
* Copyright 2016 Ocelotworks
 */


var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy.Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('config');

module.exports = function(app){
    app.passport = require('passport');

    app.passport.serializeUser(function serializeUser(user, done) {
        done(null, user.id);
    });

    app.passport.deserializeUser(function deserializeUser(id, done) {
        app.database.getUserInfo(id, done);
    });

    var baseURL = config.get("General.baseURL");
    var keys = config.get("Keys");

    app.passport.use(new GoogleStrategy({
        clientID: keys.get("Google.clientID"),
        clientSecret: keys.get("Google.clientSecret"),
        callbackURL: baseURL+"auth/google/callback"
    }, function googleStrategySuccess(accessToken, refreshToken, profile, cb){
        app.log("Logging in Google user "+profile.id);
        app.database.getOrCreateUser(profile.id, profile.displayName, profile.photos[0] ? profile.photos[0].value : "https://placekitten.com/32/32", "GOOGLE", cb);
    }));

    app.passport.use(new TwitterStrategy({
        consumerKey: keys.get("Twitter.consumerKey"),
        consumerSecret: keys.get("Twitter.consumerSecret"),
        callbackURL: baseURL+"auth/twitter/callback"
    }, function twitterStrategySuccess(token, tokenSecret, profile, cb){
        app.log("Logging in Twitter user "+profile.id);
        app.database.getOrCreateUser(profile.id, profile.displayName, profile.photos[0] ? profile.photos[0].value : "https://placekitten.com/32/32", "GOOGLE", cb);
    }));

    return {};
};