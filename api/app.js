var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var database = require("./bin/models/database.js");

var usersRouter = require('./routes/users');
var chordAPIRouter = require("./routes/chordAPI");

var app = express();


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);
app.use("/chordAPI", chordAPIRouter);

database;


module.exports = app;
