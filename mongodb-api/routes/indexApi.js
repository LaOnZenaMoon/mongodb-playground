const express = require('express');
const indexApi = express.Router();

/* GET home page. */
indexApi.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = {indexApi};
