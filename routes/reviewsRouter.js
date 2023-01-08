const Router = require('express');
const router = new Router();
const reviewsController = require('../controllers/reviewsController');

router.get('/get_all', reviewsController.getAllReviews);
router.get('/movies', reviewsController.getMovies);
router.get('/games', reviewsController.getGames);
router.get('/books', reviewsController.getBooks);
router.get('/music', reviewsController.getMusic);
router.get('/tags', reviewsController.getTags);
router.get('/likes_by_review', reviewsController.getLikesByReview);

router.post('/user_reviews', reviewsController.getReviewsByUser);
router.post('/id', reviewsController.getReviewById);
router.post('/cover_image', reviewsController.getPreviewById);
router.post('/create', reviewsController.addReview);
router.post('/update_review', reviewsController.updateReview);
router.post('/rating_review', reviewsController.rateReviewByUser);
router.post('/rating_by_user', reviewsController.reviewRatingByUser);


module.exports = router;
