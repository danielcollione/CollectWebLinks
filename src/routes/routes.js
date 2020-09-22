const express = require('express');
const routes = express.Router();

const linkController = require('../controllers/linkController');

routes.post('/link', linkController.insert);

module.exports = routes;