var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var KnexSessionStore= require('connect-session-knex')(session);
var RateLimit       = require('express-rate-limit');
var Compressor      = require('node-minify');
var caller_id       = require('caller-id');
var colors          = require('colors');
var dateFormat      = require('dateformat');
var minifyhtml      = require('express-minify-html');
var config          = require('config');
var compression     = require('compression');
var fs              = require('fs');
var async           = require('async');
var request         = require('request');

var app = express();

app.errorCount = 0;
app.requestCount = 0;



/**
 * Log a message
 * @param {string} message
 * @param {object} [caller]
 */
app.log = function log(message, caller){
    if(!caller)
        caller = caller_id.getData();
    var file = ["Nowhere"];
    if(caller.filePath)
        file = caller.filePath.split("/");

    var origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

    var output = origin+message;
    console.log(`[${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`+output);
};

/**
 * Log an error
 * @param {string} message
 */
app.error = function error(message){
    app.log(message.red, caller_id.getData());
    app.errorCount++;
    if(app.database)
        app.database.logError("APP_ERROR", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app error: "+err);
        });
};

/**
 * Like an error, but less critical
 * @param {string} message
 */
app.warn = function warn(message){
    app.log(message.yellow, caller_id.getData());
    if(app.database)
        app.database.logError("APP_WARNING", message.length > 128 ? message.substring(0, 128) : message, caller_id.getData().functionName, function(err){
            if(err)console.error("Error logging app warning: "+err);
        });
};

if(app.get('env') === 'development')
    app.warn("Started in DEVELOPMENT MODE! For better performance, set NODE_ENV to PRODUCTION");

app.log("Loading modules...");
app.ipc                 = require('./modules/ipc.js')(app);
app.jobs                = require('./modules/jobs.js')(app);
app.database            = require('./modules/database.js')(app);
app.util                = require('./modules/util.js')(app);
//app.downloader          = require('./modules/downloader.js')(app);
app.auth                = require('./modules/auth.js')(app);
app.genreImageGenerator = require('./modules/genreImageGenerator.js')(app);


app.jobs.addJob("Restart Server", {
    desc: "Restarts the server",
    args: [],
    func: process.exit
});

app.christmasMode = config.get("General.christmasMode") || false;
app.halloweenMode = config.get("General.halloweenMode") || false;

//app.downloader.processOneSong();

setTimeout(function(){
	const now = new Date();
	const month = now.getMonth();
	app.halloweenMode = month === 9;
	app.christmasMode = month === 11;
}, 8.64e7);

app.initRoutes = function initRoutes(){

    app.log("Loading middleware...");
    app.use(compression());

    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    var sessionConfig = JSON.parse(JSON.stringify(config.get("Advanced.session")));
    sessionConfig.store = new KnexSessionStore({
        knex: app.database.getKnex(),
        createtable: true
    });
    sessionConfig.cookie = config.get("Cookies");
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
        res.locals.christmasMode = app.christmasMode;
		res.locals.halloweenMode = app.halloweenMode;
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });

    if(config.get("AbuseIPDB.enabled")){
        var allowedCache = [];
        var blockedCache = [];
        app.log("AbuseIDP Checking Enabled");
        app.use(function(req, res, next){
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var forwarded = !!req.headers['x-forwarded-for'];
            if(forwarded && ip.indexOf(",") > -1)
                ip = ip.split(", ")[1];
            if(allowedCache.indexOf(ip) === -1 && blockedCache.indexOf(ip) === -1){
                request("https://www.abuseipdb.com/check/"+ip+"/json?key="+config.get("Keys.abuseipdb")+"&days="+config.get("AbuseIPDB.days"), function(err, responce, body){
                    if(!body || err || body === "[]" || body.startsWith("<")){
                        allowedCache.push(ip);
                        next();
                    }else{
                        if(!err && body){
                            blockedCache.push(ip);
                        }
                        app.warn("Banned IP Address "+ip+" for "+body);
                        res.render('banned', { reason: "Your "+ (forwarded ? "proxy" : "IP address") +" ("+ip+") has been involved in malicious activity in the past "+config.get("AbuseIPDB.days")+" days."});
                    }
                });
            }else if(allowedCache.indexOf(ip) > -1){
                next()
            }else{
                app.warn("Banned IP Address "+ip+" tried to access site again.");
                res.render('banned', {layout: false, reason: "Your "+ (forwarded ? "proxy" : "IP address") +" ("+ip+") has been involved in malicious activity in the past "+config.get("AbuseIPDB.days")+" days."});
            }
        });
    }


    app.log("Loading routes...");

    var routes = config.get("Routes");
    app.loadedRoutes = [];

    async.eachSeries(routes, function loadRoutes(route, cb){
       var router =  require(route)(app);
       if(!router.petifyInfo){
           app.error(route+" missing petifyInfo! Cannot Load!");
       }else{
           app.log("Loading route "+router.petifyInfo.name+" ("+router.petifyInfo.route+")");
           app.use(router.petifyInfo.route, router);
           app.loadedRoutes.push(router);
       }
       cb();
    });

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
    app.use(express.static(path.join(__dirname, 'public'), config.get("Static")));


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

app.updateJavascript = function() {
    new Compressor.minify({
        type: 'uglifyjs',
        fileIn: config.get("Advanced.clientOrder"),
        fileOut: 'public/js/music.js',
        callback: function (err) {
            if (err) {
                app.error("CRIT: Error minifying javascript, client WILL NOT WORK! " + err);
            }else{
                app.log("Successfully built client javascript");
            }
        }
    });
};

app.updateJavascript();

if(app.get('env') === 'development')
    fs.watch("client", {
        persistent: true,
        recursive: true
    }, function dirWatcherCB(){
        app.log("Detected JS change, rebuilding client javascript.");
        app.updateJavascript();
    });

app.jobs.addJob("Refresh Client Script", {
    desc: "Recompiles the clientside javascript file.",
    args: [],
    func: process.exit
});

process.on('SIGINT', function(){
   app.log("Received shutdown signal");
   process.exit(0);
});

module.exports = app;
