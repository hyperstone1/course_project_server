const Router = require('express');
const router = new Router();
const reviewsController = require('../controllers/reviewsController');

router.post('/create', reviewsController.addReview);
router.get('/tags', reviewsController.getTags);
// router.get('/cover_image', reviewsController.getImages);
router.post('/cover_image', reviewsController.getPreviewById);
router.get('/movies', reviewsController.getMovies);
router.get('/games', reviewsController.getGames);
router.get('/books', reviewsController.getBooks);
router.get('/music', reviewsController.getMusic);
router.post('/id', reviewsController.getReviewById);
router.get('/get_all', reviewsController.getAllReviews);
router.post('/user_reviews', reviewsController.getReviewsByUser);

module.exports = router;
