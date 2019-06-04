var createError = require('http-errors');
var express = require('express');
var path = require('path');
var morgan = require('morgan');
const winston = require('./config/winston');

var static = express();

static.use(morgan('combined', { "stream": winston.stream.write}));
static.use(express.json());
static.use(express.urlencoded({ extended: false }));
static.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
static.use(function(req, res, next) {
  next(createError(404));
});

// error handler
static.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.static.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err })
});

module.exports = static;
