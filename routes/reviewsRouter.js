const Router = require('express');
const router = new Router();
const reviewsController = require('../controllers/reviewsController');

router.post('/create', reviewsController.addReview);
router.get('/tags', reviewsController.getTags);
// router.get('/cover_image', reviewsController.getImages);
router.post('/cover_image', reviewsController.getPreviewById);
router.get('/movies', reviewsController.getMovies);

module.exports = router;
