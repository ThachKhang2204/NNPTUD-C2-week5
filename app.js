var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { connectDB } = require('./utils/config');

// Connect to MongoDB
connectDB();

var app = express();

// view engine setup (not needed for API)
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Root route - API welcome
app.get('/', function(req, res) {
  res.json({
    success: true,
    message: 'Welcome to NNPTUD API',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      roles: '/api/v1/roles',
      categories: '/api/v1/categories',
      products: '/api/v1/products',
      enableUser: '/api/v1/users/enable',
      disableUser: '/api/v1/users/disable'
    },
    documentation: 'Use the endpoints above to interact with the API'
  });
});

app.use('/api/v1/', require('./routes/index'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// error handler
app.use(function(err, req, res, next) {
  // send error response as JSON
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
