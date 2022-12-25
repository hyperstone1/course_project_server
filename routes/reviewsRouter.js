const Router = require('express');
const router = new Router();
const reviewsController = require('../controllers/reviewsController');

router.post('/add', reviewsController.addReview);
router.get('/tags', reviewsController.getTags);

module.exports = router;
