const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/auth');
const { requireRole, requireChiefOrAdmin } = require('../middleware/rbac');

router.use(authenticateUser);
router.use(requireChiefOrAdmin);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// User & Role Management (Super Admin only)
router.get('/users', requireRole('SUPER_ADMIN'), adminController.getUsers);
router.put('/users/:id/role', requireRole('SUPER_ADMIN'), adminController.updateUserRole);

// Subscribers
router.get('/subscribers', adminController.getSubscribers);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', requireRole('SUPER_ADMIN'), adminController.deleteCategory);

// Tags
router.get('/tags', adminController.getTags);
router.post('/tags', adminController.createTag);

// Subscription Plans
router.put('/plans/:id', requireRole('SUPER_ADMIN'), adminController.updatePlan);

// Activity Logs
router.get('/logs', adminController.getActivityLogs);

module.exports = router;
