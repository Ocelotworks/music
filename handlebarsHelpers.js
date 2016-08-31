/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

console.log("Registering handlebars partials");

Handlebars.registerPartial('song', '<span class="song" data-id="{{song_id}}" data-artist="{{artist_id}}">{{name}} - {{title}}</span>');


