const express = require('express');
const routes = express.Router();

const linkController = require('../controllers/linkController');
const listLinksController = require('../controllers/listLinksController');

routes.post('/link', linkController.insert);

routes.get('/list', listLinksController.list);


module.exports = routes;