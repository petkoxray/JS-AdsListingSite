const userController = require('./user');
const categoryController = require('./category');
const townController = require('./town');
const adsController = require('./ads');

module.exports = {
  user: userController,
  category: categoryController,
  town: townController,
  ads: adsController
};