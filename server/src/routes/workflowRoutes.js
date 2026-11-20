const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { authenticateUser } = require('../middleware/auth');
const { requireStaff, requireEditorOrAdmin, requireChiefOrAdmin } = require('../middleware/rbac');

router.use(authenticateUser);

router.get('/queue', requireEditorOrAdmin, workflowController.getQueue);
router.post('/:id/submit', requireStaff, workflowController.submitForReview);
router.post('/:id/approve', requireEditorOrAdmin, workflowController.approveArticle);
router.post('/:id/reject', requireEditorOrAdmin, workflowController.rejectArticle);
router.post('/:id/publish', requireChiefOrAdmin, workflowController.publishArticle);
router.get('/:id/history', requireStaff, workflowController.getArticleHistory);

module.exports = router;
