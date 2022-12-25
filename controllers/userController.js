const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

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
}

module.exports = new UserController();
