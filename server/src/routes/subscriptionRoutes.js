const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateUser } = require('../middleware/auth');

// Public plans
router.get('/plans', subscriptionController.getPlans);

// Webhook endpoint (must not be guarded by user auth)
router.post('/webhook', subscriptionController.handleWebhook);

// Protected subscription endpoints
router.post('/create-order', authenticateUser, subscriptionController.createOrder);
router.post('/verify-payment', authenticateUser, subscriptionController.verifyPayment);
router.post('/cancel', authenticateUser, subscriptionController.cancelSubscription);
router.get('/my-status', authenticateUser, subscriptionController.getMyStatus);

module.exports = router;
