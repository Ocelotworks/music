/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

console.log("Registering handlebars partials");

Handlebars.registerPartial('song', '<span class="song" data-id="{{song_id}}" data-artist="{{artist_id}}">{{name}} - {{title}}</span>');
Handlebars.registerPartial('playlist', '<div class="song">\n    <span class="radioTitle">\n        {{#if private}}\n            <i class="fa fa-lock" title="Private"></i>\n        {{/if}}\n        {{title}}\n    </span>\n    <span class="radioDesc">{{count}} songs</span>\n    \n    <span class="addedBy">Added By<span class="addedByName">\n        <img class="avatar" src="{{addedBy.avatar}}">{{addedBy.name}}\n    </span>\n    </span>\n</div>');
Handlebars.registerPartial('radio', ' <div class="song"> <span class="radioTitle">{{title}}</span> <span class="radioDesc">{{listeners}}listeners |{{desc}}</span> <span class="addedBy"> Added By <span class="addedByName"> <img class="avatar" src="{{addedBy.avatar}}">{{addedBy.name}}</span> </span> </div>');
