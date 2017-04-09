/*
* Copyright Ocelotworks 2016
*/


const Handlebars = require('hbs');
const config = require('config');

Handlebars.registerPartial('user', '<img src="{{user.avatar}}" class="avatar userlevel-{{user.userlevel}}" id="userAvatar"><span class="username userlevel-{{user.userlevel}}">{{user.username}}</span>');
Handlebars.registerPartial('song', '<span class="song songData" ng-click="playSong($event)" ng-right-click="showSongContextMenu($event)" data-id="{{song_id}}" data-artist="{{artist_id}}" data-album="{{album}}"><i class="fa fa-ellipsis-v contextClick" ng-click="showContextMenu($event)" ng-hide="!isMobile"></i> {{name}}&nbsp;-&nbsp;{{title}}</span>');
Handlebars.registerPartial('playlist', '<div class="song" ng-click="playPlaylist(\'{{id}}\')" data-id="{{id}}">\n    <span class="radioTitle">\n        {{#if private}}\n            <i class="fa fa-lock" title="Private"></i>\n        {{/if}}\n        {{name}}\n    </span>\n    <span class="radioDesc">{{count}} songs</span>\n    \n    <span class="addedBy">Added By<span class="addedByName">\n        {{> user user=this}}\n    </span>\n    </span>\n</div>');
Handlebars.registerPartial('radio', ' <div class="song" ng-click="playRadio($event)"> <span class="radioTitle">{{title}}</span> <span class="radioDesc">{{listeners}} listeners |{{desc}}</span> <span class="addedBy"> Added By <span class="addedByName"> {{>user user=addedBy}}</span> </span> </div>');
Handlebars.registerPartial('artist', '<div class="song" ng-click="playArtist(\'{{id}}\')">{{name}}</div>');
Handlebars.registerPartial('album', '<div class="album" ng-click="playAlbum(\'{{id}}\')">\n    <img src="album/{{id}}">\n    <span>{{name}}</span>\n</div>');
Handlebars.registerPartial('genre', '<div class="album" ng-click="playGenre(\'{{id}}\')">\n    <img src="genre/{{id}}">\n    <span>{{name}}</span>\n</div>');
Handlebars.registerPartial('card', '<div class="songCard songData" ng-click="playSong($event)" ng-right-click="showSongContextMenu($event)" data-id="{{song_id}}" data-artist="{{artist_id}}" data-album="{{album_id}}">\n    <img class="cardImage" src="album/{{album_id}}" alt="{{album_name}}">\n    <span class="cardTitle">{{artist_name}}&nbsp;-&nbsp;{{title}}</span>\n</div>');




Handlebars.registerHelper('prettyParseDuration', function(seconds){


    var duration = seconds.toFixed(2);
    var prefix = "second";
    if(seconds >= 3.154e+7){
        duration    = (seconds/3.154e+7).toFixed(2);
        prefix      = "year";
    }else if(seconds >= 2.628e+6){
        duration    = (seconds/2.628e+6).toFixed(2);
        prefix      = "month";
    }else if(seconds >= 604800){
        duration    = (seconds/604800).toFixed(2);
        prefix      = "week";
    }else if(seconds >= 86400){
        duration    = (seconds/86400).toFixed(2);
        prefix      = "day";
    }else if(seconds >= 3600){
        duration    = (seconds/3600).toFixed(2);
        prefix      = "hour";
    }else if(seconds >= 60){
        duration    = (seconds/60).toFixed(2);
        prefix      = "minute";
    }
    return duration+" "+prefix+(duration > 1 ? "s" : "");

});

Handlebars.registerHelper('prettyParseIntegerDuration', function(seconds){
    var duration = seconds;
    var prefix = "second";
    if(seconds >= 3.154e+7){
        duration    = (seconds/3.154e+7).toFixed(0);
        prefix      = "year";
    }else if(seconds >= 2.628e+6){
        duration    = (seconds/2.628e+6).toFixed(0);
        prefix      = "month";
    }else if(seconds >= 604800){
        duration    = (seconds/604800).toFixed(0);
        prefix      = "week";
    }else if(seconds >= 86400){
        duration    = (seconds/86400).toFixed(0);
        prefix      = "day";
    }else if(seconds >= 3600){
        duration    = (seconds/3600).toFixed(0);
        prefix      = "hour";
    }else if(seconds >= 60){
        duration    = (seconds/60).toFixed(0);
        prefix      = "minute";
    }
    return duration+" "+prefix+(duration > 1 ? "s" : "");
});

Handlebars.registerHelper('prettyParseMemory', function(bytes){
    if(bytes < 1000)return bytes+" bytes"; //< 1kb
    if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
    if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
    if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
    if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
    return parseInt(bytes/1e+15)+"PB";
});

function quantify(data, unit, value) {
    if (value) {
        if (value > 1 || value < -1)
            unit += 's';

        data.push(value + ' ' + unit);
    }

    return data;
}


Handlebars.registerHelper("longDuration", function(seconds){
    var prettyString = '',
        data = [];

    if (typeof seconds === 'number') {

        data = quantify(data, 'year',   parseInt(seconds / 31556926));
        data = quantify(data, 'day',    parseInt(seconds / 86400));
        data = quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
        data = quantify(data, 'minute', parseInt((seconds % 3600) / 60));
        data = quantify(data, 'second', Math.floor(seconds % 60));

        var length = data.length,
            i;

        for (i = 0; i < length; i++) {

            if (prettyString.length > 0)
                if (i == length - 1)
                    prettyString += ' and ';
                else
                    prettyString += ', ';

            prettyString += data[i];
        }
    }

    return prettyString;
});

Handlebars.registerHelper("config", function(key){
   return config.get(key);
});

Handlebars.registerHelper("isObject", function(data, options){
    return typeof data === "object" ? options.fn(this) :  options.inverse(this);
});