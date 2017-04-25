const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');

module.exports = {
  index: (req, res) => {
      Ad.find({}).sort({date: 'desc'}).limit(6).populate('author category town').then(ads => {
          ads.forEach(ad => {
              if(ad.content.length > 20)
                ad.content = ad.content.substr(0, 20) + '...';
          });
          res.render('home/index', { ads: ads});
      });
  }
};