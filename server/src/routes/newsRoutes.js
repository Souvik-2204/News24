const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { optionalAuth } = require('../middleware/auth');

router.get('/featured', optionalAuth, newsController.getFeatured);
router.get('/ticker', newsController.getTicker);
router.get('/latest', newsController.getLatest);
router.get('/trending', newsController.getTrending);
router.get('/categories', newsController.getCategories);
router.get('/category/:slug', newsController.getByCategory);
router.get('/article/:slug', optionalAuth, newsController.getArticleBySlug);
router.get('/search', newsController.searchArticles);
router.post('/newsletter', newsController.subscribeNewsletter);

module.exports = router;
