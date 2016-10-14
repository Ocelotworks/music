var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var RateLimit       = require('express-rate-limit');
var Compressor      = require('node-minify');
var caller_id       = require('caller-id');
var colors          = require('colors');
var dateFormat      = require('dateformat');
var minifyhtml      = require('express-minify-html');
var config          = require('config');


var app = express();

app.log = function(message, caller){
    if(!caller)
        caller = caller_id.getData();
    var file = ["Nowhere"];
    if(caller.filePath)
        file = caller.filePath.split("/");

    var origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

    var output = origin+message;
    console.log(`[${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`+output);
};

app.error = function(message){
    app.log(message.red, caller_id.getData());
};

app.warn = function(message){
    app.log(message.orange, caller_id.getData());
};

if(app.get('env') === 'development')
    app.warn("Started in DEVELOPMENT MODE! For better performance, set NODE_ENV to PRODUCTION");


app.database = require('./modules/database.js')(app);
app.downloader = require('./modules/downloader.js')(app);
app.auth = require('./modules/auth.js')(app);
app.downloader.processOneSong();

app.initRoutes = function(){


    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(session(config.get("Advanced.session")));
    app.use(bodyParser.urlencoded(config.get("Advanced.bodyparser")));
    app.use(cookieParser());
    app.use(app.passport.initialize());
    app.use(app.passport.session());

    app.use(minifyhtml({
        htmlMinifier: config.get("Advanced.htmlMinifier")
    }));

    app.use('/',                    require('./routes/index')(app));
    app.use('/auth',                require('./routes/auth')(app));
    app.use('/search',              require('./routes/search')(app));
    app.use('/api',                 require('./routes/api')(app));
    app.use('/templates',           require('./routes/templates.js')(app));
    app.use('/templates/admin',     require('./routes/templates/admin')(app));
    app.use('/templates/modals',    require('./routes/templates/modals')(app));
    app.use('/ws',                  require('./routes/websocket')(app));

    //Rate limiting
    app.enable('trust proxy');
    app.use(new RateLimit({
        windowMs: config.get("RateLimiter.General.window"),
        max: config.get("RateLimiter.General.max"),
        delayMs: config.get("RateLimiter.General.delay"),
        headers: config.get("RateLimiter.General.headers"),
        keyGenerator: function(req){
            return req.user ? req.user.id : req.ip;
        }
    }));

    app.use('/templates/add', new RateLimit({
        windowMs: config.get("RateLimiter.General.window"),
        max: config.get("RateLimiter.General.max"),
        delayMs: config.get("RateLimiter.General.delay"),
        headers: config.get("RateLimiter.General.headers"),
        keyGenerator: function(req){
            return req.user ? req.user.id : req.ip;
        }
    }));


    app.use(require('less-middleware')(path.join(__dirname, 'less'), {
        debug: app.get('env') === 'development',
        dest: path.join(__dirname, 'public'),
        force: app.get('env') === 'development'
    }));
    app.use(express.static(path.join(__dirname, 'public')));


    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function devErrorHandler(err, req, res, next) {
            res.status(err.status || 500);
            app.error("Error at "+req.url);
            res.render('error', {
                message: err.message+" ("+req.url+")",
                error: err,
                layout: false
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        res.render('error', {
            message: err.message,
            error: {},
            layout: false
        });
    });

    app.renderError = function(err, res){
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: app.get('env') === 'development' ? err : {},
            layout: false
        });
    };
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Object setup
require('./handlebarsHelpers.js');

new Compressor.minify({
    type: 'uglifyjs',
    fileIn:  [
        "client/AppInit.js",
        "client/UpdateManager.js",
        "client/RootScope.js",
        "client/admin/AdminController.js",
        "client/AddController.js",
        "client/AddPlaylistController.js",
        "client/ContextMenuController.js",
        "client/PlaylistController.js",
        "client/ModalController.js",
        "client/SongController.js",
        "client/TabController.js",
        "client/SettingsController.js"
    ],
    fileOut: 'public/js/music.js',
    callback: function(err){
        if(err){
            console.error("CRIT: Error minifying javascript, client WILL NOT WORK! "+err);
        }
    }
});

module.exports = app;
