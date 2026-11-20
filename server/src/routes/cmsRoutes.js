const express = require('express');
const router = express.Router();
const articleCmsController = require('../controllers/articleCmsController');
const { authenticateUser } = require('../middleware/auth');
const { requireStaff } = require('../middleware/rbac');

router.use(authenticateUser);
router.use(requireStaff);

router.get('/articles', articleCmsController.getCmsArticles);
router.get('/articles/:id', articleCmsController.getCmsArticleById);
router.post('/articles', articleCmsController.createCmsArticle);
router.put('/articles/:id', articleCmsController.updateCmsArticle);
router.delete('/articles/:id', articleCmsController.deleteCmsArticle);

module.exports = router;
