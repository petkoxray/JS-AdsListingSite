const Ad = require('mongoose').model('Ad');

module.exports = {
  index: (req, res) => {
      res.render('category/index');
  },
    category: (req, res) => {
      let id = req.params.id;
      Ad.find({category: id}).populate('town author category').then(ads => {
          res.render('category/index', {ads: ads})
      })
    }

};
