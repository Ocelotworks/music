/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

console.log("Registering handlebars partials");


Handlebars.registerPartial('user', '<img src="{{user.avatar}}" class="avatar userlevel-{{user.userlevel}}" id="userAvatar"><span class="username userlevel-{{user.userlevel}}">{{user.username}}</span>');
Handlebars.registerPartial('song', '<span class="song" ng-click="playSong($event)" ng-right-click="showSongContextMenu($event)" data-id="{{song_id}}" data-artist="{{artist_id}}" data-album="{{album}}">{{name}}&nbsp;-&nbsp;{{title}}</span>');
Handlebars.registerPartial('playlist', '<div class="song" ng-click="playPlaylist(\'{{id}}\')" data-id="{{id}}">\n    <span class="radioTitle">\n        {{#if private}}\n            <i class="fa fa-lock" title="Private"></i>\n        {{/if}}\n        {{name}}\n    </span>\n    <span class="radioDesc">{{count}} songs</span>\n    \n    <span class="addedBy">Added By<span class="addedByName">\n        {{> user user=this}}\n    </span>\n    </span>\n</div>');
Handlebars.registerPartial('radio', ' <div class="song" ng-click="playRadio($event)"> <span class="radioTitle">{{title}}</span> <span class="radioDesc">{{listeners}} listeners |{{desc}}</span> <span class="addedBy"> Added By <span class="addedByName"> {{>user user=addedBy}}</span> </span> </div>');
Handlebars.registerPartial('artist', '<div class="song" ng-click="playArtist(\'{{id}}\')">{{name}}</div>');
Handlebars.registerPartial('album', '<div class="album" ng-click="playAlbum(\'{{id}}\')">\n    <img src="album/{{id}}">\n    <span>{{name}}</span>\n</div>');
Handlebars.registerPartial('genre', '<div class="album" ng-click="playGenre(\'{{id}}\')">\n    <img src="genre/{{id}}">\n    <span>{{name}}</span>\n</div>');