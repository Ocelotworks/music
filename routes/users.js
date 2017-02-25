var express = require('express');
var router = express.Router();


module.exports = function(app){

    router.petifyInfo = {
        name: "Users Stub",
        route: "/users"
    };

    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.send('respond with a resource');
    });

  return router;
};



