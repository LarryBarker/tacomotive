const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

// default index page
router.get('/', (req, res) => res.render('index'));

// show login form
router.get('/login', (req, res) => res.render('login'));

// show signup form
router.get('/signup', (req, res) => res.render('signup'));

// handle signups
router.post('/signup', AuthController.signup);

// handle login
router.post('/login', AuthController.login);

// handle logout
router.get('/logout', AuthController.logout);

module.exports = router;