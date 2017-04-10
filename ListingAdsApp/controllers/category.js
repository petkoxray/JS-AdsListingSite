const Ad = require('mongoose').model('Ad');

module.exports = {
  index: (req, res) => {
      res.render('category/index');
  },
    category: (req, res) => {
      let id = req.params.id;
      Ad.find({category: id}).populate('town author category').then(ads => {
          let categoryName = '';
          if(ads[0]) {
              categoryName = ads[0].category.name;
          }
          res.render('category/index', {ads: ads, categoryName: categoryName})
      })
    }

};
