var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');


var app = express();

app.database = require('./modules/database.js')(app);
app.downloader = require('./modules/downloader.js')(app);
app.auth = require('./modules/auth.js')(app);

//require('./modules/petify-import.js')(app);

app.downloader.processOneSong();
//
//app.database.getOrCreateArtist("Savant", function(err, res){
//    console.log(err);
//    console.log(res);
//});


//app.database.addSongToQueue("https://www.youtube.com/watch?v=ykW4rtW2eu0", "nsp", "test", "The Veronicas", "Untouched", null, function(err, res){
//
//    console.log(res);
//});




var routes          = require('./routes/index')(app);
var users           = require('./routes/users')(app);
var auth            = require('./routes/auth')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Object setup
require('./handlebarsHelpers.js');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({ secret: 'aTotallyTemporarySecret' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(app.passport.initialize());
app.use(app.passport.session());

app.use(require('less-middleware')(path.join(__dirname, 'less'), {
    debug: app.get('env') === 'development',
    dest: path.join(__dirname, 'public'),
    force: app.get('env') === 'development'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/auth', auth);
app.use('/templates', require('./routes/templates')(app));
//app.use('/users', users);

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
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.renderError = function(err, res){
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: app.get('env') === 'development' ? err : {}
    });
};


module.exports = app;
