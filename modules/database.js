/*
* Copyright Ocelotworks 2016
 */

var config  = require('config').get("Database");
var knex    = require('knex');



module.exports = function(app){
    return {
        name: "Database Handler",
        init: function(cb){

        }
    }
};