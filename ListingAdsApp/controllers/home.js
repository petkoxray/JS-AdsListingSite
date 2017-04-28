const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const Category = mongoose.model('Category');
const Town = mongoose.model('Town');
const Utils = require('./../utilities/utils');

module.exports = {
  index: (req, res) => {
    Ad.find({}).sort({date: 'desc'}).limit(6).populate('author category town').then(ads => {
      Category.find().then(cat => {
        Town.find().then(town => {
          res.render('home/index',
            {ads: Utils.adsReformat(ads),categories: cat,towns: town});
        });
      });
    });
  }
};