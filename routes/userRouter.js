const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');

router.get('/users', userController.allUsers);
router.post('/user_likes', userController.likesByUser);
router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/like', userController.likeReview);
router.post('/rating_author', userController.likeReview);




module.exports = router;
