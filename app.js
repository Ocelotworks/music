var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var KnexSessionStore= require('connect-session-knex')(session);
var RateLimit       = require('express-rate-limit');
var Compressor = require('node-minify');
var caller_id       = require('caller-id');
var colors          = require('colors');
var dateFormat      = require('dateformat');
var minifyhtml      = require('express-minify-html');
var config          = require('config');

var app = express();

app.errorCount = 0;
app.requestCount = 0;

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
    app.errorCount++;
    if(app.database)
        app.database.logError("APP_ERROR", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app error: "+err);
        });
};

app.warn = function(message){
    app.log(message.yellow, caller_id.getData());
    if(app.database)
        app.database.logError("APP_WARNING", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app warning: "+err);
        });
};

if(app.get('env') === 'development')
    app.warn("Started in DEVELOPMENT MODE! For better performance, set NODE_ENV to PRODUCTION");

app.log("Loading modules...");
app.database            = require('./modules/database.js')(app);
app.downloader          = require('./modules/downloader.js')(app);
app.auth                = require('./modules/auth.js')(app);
app.genreImageGenerator = require('./modules/genreImageGenerator.js')(app);

app.downloader.processOneSong();

app.initRoutes = function initRoutes(){

    app.log("Loading middleware...");
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    var sessionConfig = JSON.parse(JSON.stringify(config.get("Advanced.session")));
    sessionConfig.store = new KnexSessionStore({
        knex: app.database.getKnex(),
        createtable: true
    });
    sessionConfig.cookie = {
        maxAge: 1e100
    };
    app.use(session(sessionConfig));
    app.use(bodyParser.urlencoded(config.get("Advanced.bodyparser")));
    app.use(cookieParser());
    app.use(app.passport.initialize());
    app.use(app.passport.session());

    app.use(minifyhtml({
        htmlMinifier: JSON.parse(JSON.stringify(config.get("Advanced.htmlMinifier"))) //ayy lmao
    }));

    app.use(function(req, res, next){
        app.requestCount++;
        res.locals.christmasMode = true;
        next();
    });

    app.log("Loading routes...");

    app.use('/',                    require('./routes/index')(app));
    app.use('/auth',                require('./routes/auth')(app));
    app.use('/search',              require('./routes/search')(app));
    app.use('/api',                 require('./routes/api')(app));
    app.use('/templates',           require('./routes/templates.js')(app));
    app.use('/templates/admin',     require('./routes/templates/admin')(app));
    app.use('/templates/modals',    require('./routes/templates/modals')(app));
    app.use('/templates/songs',     require('./routes/templates/songs.js')(app));
    app.use('/templates/settings',  require('./routes/templates/settings.js')(app));
    app.use('/templates/delete',    require('./routes/templates/delete.js')(app));
    app.use('/templates/add',       require('./routes/templates/add.js')(app));
    app.use('/templates/stats',     require('./routes/templates/stats.js')(app));
    app.use('/ws',                  require('./routes/websocket')(app));

    app.log("Loading some more middleware...");
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
        force: false
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
                title: "Error",
                message: err.message+" ("+req.url+")",
                error: err
            });
            app.database.logError("PAGE_ERROR", err.message.length > 128 ? err.message.substring(0, 128) : err.message, caller_id.getData().functionName);
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        res.render('error', {
            title: "Error",
            message: err.message,
            error: {}
        });
        app.database.logError("PAGE_ERROR", err.message.length > 128 ? err.message.substring(0, 128) : err.message, caller_id.getData().functionName);
    });

    app.renderError = function(err, res){
        res.status(err.status || 500);
        res.render('error', {
            title: "Error",
            message: err.message,
            error: app.get('env') === 'development' ? err : {}
        });
        app.database.logError("PAGE_ERROR", err.message.length > 128 ? err.message.substring(0, 128) : err.message, caller_id.getData().functionName);
    };
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Object setup
require('./handlebarsHelpers.js');
app.log("Compiling clientside javascript...");
new Compressor.minify({
    type: 'uglifyjs',
    fileIn:  [
        "client/AppInit.js",
        "client/UpdateManager.js",
        "client/RootScope.js",
        "client/admin/AdminController.js",
        "client/AddController.js",
        "client/AddDeviceController.js",
        "client/AddPlaylistController.js",
        "client/AddToPlaylistController.js",
        "client/ContextMenuController.js",
        "client/PlaylistController.js",
        "client/ModalController.js",
        "client/SongController.js",
        "client/TabController.js",
        "client/SongInfoTabController.js",
        "client/SettingsController.js"
    ],
    fileOut: 'public/js/music.js',
    callback: function(err){
        if(err){
            app.error("CRIT: Error minifying javascript, client WILL NOT WORK! "+err);
        }
    }
});

module.exports = app;
