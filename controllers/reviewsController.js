const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Review = require('../model/user');
const Tags = require('../model/tags');

const generateJwt = (id, email, name) => {
  return jwt.sign({ id, email, name }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

class ReviewsController {
  async addReview(req, res, next) {
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

  async getTags(req, res) {
    try {
      const tags = await Tags.findAll();
      res.json([{ title: 'clock' }, { title: 'alert' }, { title: 'login' }]);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
}

module.exports = new ReviewsController();
