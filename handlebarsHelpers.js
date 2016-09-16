/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

console.log("Registering handlebars partials");

Handlebars.registerPartial('song', '<span class="song" ng-click="playSong($event)" data-id="{{song_id}}" data-artist="{{artist_id}}">{{name}}&nbsp;-&nbsp;{{title}}</span>');
Handlebars.registerPartial('playlist', '<div class="song" ng-click="playPlaylist($event)" data-id="{{id}}">\n    <span class="radioTitle">\n        {{#if private}}\n            <i class="fa fa-lock" title="Private"></i>\n        {{/if}}\n        {{title}}\n    </span>\n    <span class="radioDesc">{{count}} songs</span>\n    \n    <span class="addedBy">Added By<span class="addedByName">\n        <img class="avatar" src="{{addedBy.avatar}}">{{addedBy.name}}\n    </span>\n    </span>\n</div>');
Handlebars.registerPartial('radio', ' <div class="song" ng-click="playRadio($event)"> <span class="radioTitle">{{title}}</span> <span class="radioDesc">{{listeners}}listeners |{{desc}}</span> <span class="addedBy"> Added By <span class="addedByName"> <img class="avatar" src="{{addedBy.avatar}}">{{addedBy.name}}</span> </span> </div>');
Handlebars.registerPartial('artist', '<div class="song">{{name}}</div>');