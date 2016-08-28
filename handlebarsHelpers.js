/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

console.log("Registering handlebars partials");

Handlebars.registerPartial('song', "<div class='song' data-id='{{id}}'>{{artist}} - {{title}}</div>");

