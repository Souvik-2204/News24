const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateUser, authController.getMe);
router.post('/demo-login/:roleKey', authController.demoLogin);

module.exports = router;
