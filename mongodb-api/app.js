const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {indexApi, userApi, blogApi, commentApi} = require('./routes');
const mongoose = require("mongoose");
const {generateFakeData} = require('./faker');

const app = express();

const server = async () => {
  try {
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    // use middleware
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/index', indexApi);
    app.use('/user', userApi);
    app.use('/blog', blogApi);
    app.use('/blog/:blogId/comment', commentApi);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    // mongoDB Driver - mongoose
    await mongoose.connect(
      'mongodb+srv://laonzenamoon:zNaGAK8aJbISMAc6@cluster-playground.7oyiw.mongodb.net/BlogService?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    );
    mongoose.set('debug', true);
    console.log('MongoDB connected');

    // generateFakeData(100, 10, 30);
  } catch (error) {
    console.log(error);
  }
}

server();

module.exports = app;
