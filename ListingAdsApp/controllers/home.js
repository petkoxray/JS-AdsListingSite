const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');

module.exports = {
  index: (req, res) => {
      Ad.find({}).sort({date: 'desc'}).limit(6).populate('author').then(ads => {
          ads.forEach(ads => {
              ads.content = ads.content.substr(0, 20) + '...';
          });
          res.render('home/index', { ads: ads})
      })
  }
};