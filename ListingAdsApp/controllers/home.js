const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');

module.exports = {
  index: (req, res) => {
      Ad.find({}).limit(6).populate('author').then(ads => {
          res.render('home/index', { ads: ads})
      })
  }
};