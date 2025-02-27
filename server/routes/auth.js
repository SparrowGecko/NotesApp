const express = require('express');
const { githubLogin, githubCallback, refreshAccessToken, logout } = require('../controllers/authController');

const router = express.Router();

router.get('/github', githubLogin);

router.get('/callback', githubCallback);

router.post('/refresh-token', refreshAccessToken);

router.post('/logout', logout);

module.exports = router;