const Ad = require('mongoose').model('Ad');

module.exports = {
  adsGet: (req, res) => {
    Ad.find({})
      .sort({ date: 'desc' })
      .populate('author category town comments')
      .then(ads => {
        ads.forEach(ads => {
          ads.title = ads.title.substr(0, 10) + '...';
        });
        res.render('admin/ads', { ads: ads });
      });
  },
};