const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Likes = require('../model/likes');
const Review = require('../model/review');

const generateJwt = (id, email, name) => {
  return jwt.sign({ id, email, name }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

class UserController {
  async registration(req, res, next) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(ApiError.badRequest('Fill in the text fields'));
    }
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(ApiError.badRequest('User with this email already exists'));
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({
      email,
      password: hashPassword,
      name,
    });
    const token = generateJwt(user.id, user.email, user.name);
    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password, date } = req.body;
    const user = await User.findOne({ where: { email } });
    const updatedDate = await User.update({ dateLogin: date }, { where: { email } });
    if (!user) {
      return next(ApiError.internal('User with this name not found'));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal('Wrong password specified'));
    }
    if (user.status === 'blocked') {
      return next(ApiError.internal('The user is blocked'));
    }
    const token = jwt.sign({ id: user.id, email, name: user.name }, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });
    return res.json({ token });
  }

  async allUsers(req, res) {
    try {
      const usersTable = await User.findAll();
      res.json(usersTable);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
  async likeReview(req, res) {
    const { id, idUser } = req.body;
    try {
      if (idUser) {
        console.log(id, idUser);
        const likeReviewExist = await Likes.findAll({ where: { idReview: id, idUser: idUser } });
        if (likeReviewExist.length > 0) {
          const unlike = await Likes.destroy({ where: { id: likeReviewExist[0].dataValues.id } });
          const allLikesReview = await Likes.findAll({ where: { idReview: id } });
          const review = await Review.update(
            { likes: allLikesReview.length },
            { where: { id: id } },
          );

          console.log('likes count: ', review.length);
          res.json(allLikesReview.length);
        } else {
          const reviewLike = await Likes.create({ idReview: id, idUser: idUser });
          const allLikesReview = await Likes.findAll({ where: { idReview: id } });
          const review = await Review.update(
            { likes: allLikesReview.length },
            { where: { id: id } },
          );
          res.json(allLikesReview.length);
        }
      } else {
        res.json({ message: 'Only registered users can like the review' });
      }
    } catch (error) {
      res.json(error);
    }
  }

  async likesByUser(req, res) {
    const { userId } = req.body;
    console.log('req.body: ', req.body);
    try {
      if (userId !== '') {
        const likesByUser = await Likes.findAll({ where: { idUser: userId } });
        console.log('likesByUser: ', likesByUser);
        res.json(likesByUser);
      } else {
        res.json('Войдите в аккаунт');
      }
    } catch (error) {
      res.json(error);
    }
  }
}

module.exports = new UserController();
