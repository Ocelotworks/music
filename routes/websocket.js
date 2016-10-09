/*
* Copyright Ocelotworks 2016
*/

var express = require('express');
var router = express.Router();


module.exports = function(app){

    router.ws('/updates/', function(ws){

    });

    return router;
};