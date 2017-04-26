const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const Utils = require('./../utilities/utils');

module.exports = {
  index: (req, res) => {
    Ad.find({}).sort({date: 'desc'}).limit(6).populate('author category town').then(ads => {
      res.render('home/index', {ads: Utils.adsReformat(ads)});
    });
  }
};