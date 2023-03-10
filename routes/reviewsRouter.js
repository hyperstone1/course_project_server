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
router.get('/best', reviewsController.getBestReviews);
router.post('/reviews_by_tag', reviewsController.getReviewsByTag);

router.post('/user_reviews', reviewsController.getReviewsByUser);
router.post('/id', reviewsController.getReviewById);
router.post('/cover_image', reviewsController.getPreviewById);
router.post('/create', reviewsController.addReview);
router.post('/update_review', reviewsController.updateReview);
router.post('/rating_review', reviewsController.rateReviewByUser);
router.post('/rating_by_user', reviewsController.reviewRatingByUser);
router.post('/search', reviewsController.findMatches);
router.post('/send_comment', reviewsController.sendComment);
router.post('/comments', reviewsController.getComments);

module.exports = router;
