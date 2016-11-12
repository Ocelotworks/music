/*
* Copyright Ocelotworks 2016
*/


var Handlebars = require('hbs');

Handlebars.registerPartial('user', '<img src="{{user.avatar}}" class="avatar userlevel-{{user.userlevel}}" id="userAvatar"><span class="username userlevel-{{user.userlevel}}">{{user.username}}</span>');
Handlebars.registerPartial('song', '<span class="song" ng-click="playSong($event)" ng-right-click="showSongContextMenu($event)" data-id="{{song_id}}" data-artist="{{artist_id}}" data-album="{{album}}">{{name}}&nbsp;-&nbsp;{{title}}</span>');
Handlebars.registerPartial('playlist', '<div class="song" ng-click="playPlaylist(\'{{id}}\')" data-id="{{id}}">\n    <span class="radioTitle">\n        {{#if private}}\n            <i class="fa fa-lock" title="Private"></i>\n        {{/if}}\n        {{name}}\n    </span>\n    <span class="radioDesc">{{count}} songs</span>\n    \n    <span class="addedBy">Added By<span class="addedByName">\n        {{> user user=this}}\n    </span>\n    </span>\n</div>');
Handlebars.registerPartial('radio', ' <div class="song" ng-click="playRadio($event)"> <span class="radioTitle">{{title}}</span> <span class="radioDesc">{{listeners}} listeners |{{desc}}</span> <span class="addedBy"> Added By <span class="addedByName"> {{>user user=addedBy}}</span> </span> </div>');
Handlebars.registerPartial('artist', '<div class="song" ng-click="playArtist(\'{{id}}\')">{{name}}</div>');
Handlebars.registerPartial('album', '<div class="album" ng-click="playAlbum(\'{{id}}\')">\n    <img src="album/{{id}}">\n    <span>{{name}}</span>\n</div>');
Handlebars.registerPartial('genre', '<div class="album" ng-click="playGenre(\'{{id}}\')">\n    <img src="genre/{{id}}">\n    <span>{{name}}</span>\n</div>');


Handlebars.registerHelper('prettyParseDuration', function(seconds){
    if(seconds < 60)return seconds+" seconds"; //< 1 minute
    if(seconds < 3600)return (seconds/60).toFixed(2)+" minutes"; //< 1 hour
    if(seconds < 86400)return (seconds/3600).toFixed(2)+" hours"; //< 1 day
    if(seconds < 604800)return (seconds/86400).toFixed(2)+" days"; //< 1 week
    if(seconds < 2.628e+6)return (seconds/604800).toFixed(2)+" weeks"; //< 1 year
    if(seconds < 3.154e+7)return (seconds/2.628e+6).toFixed(2)+" months"; //< 1 year
    return (seconds/3.154e+7).toFixed(2)+" years";
});

Handlebars.registerHelper('prettyParseIntegerDuration', function(seconds){
    if(seconds < 60)return seconds+" seconds"; //< 1 minute
    if(seconds < 3600)return parseInt(seconds/60)+" minutes"; //< 1 hour
    if(seconds < 86400)return parseInt(seconds/3600)+" hours"; //< 1 day
    if(seconds < 604800)return parseInt(seconds/86400)+" day"; //< 1 week
    if(seconds < 2.628e+6)return parseInt(seconds/604800)+" weeks"; //< 1 year
    if(seconds < 3.154e+7)return parseInt(seconds/2.628e+6)+" months"; //< 1 year
    return parseInt(seconds/3.154e+7)+" years";
});

Handlebars.registerHelper('prettyParseMemory', function(bytes){
    if(bytes < 1000)return bytes+" bytes"; //< 1kb
    if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
    if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
    if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
    if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
    return parseInt(bytes/1e+15)+"PB";
});