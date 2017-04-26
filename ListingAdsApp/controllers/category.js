const Ad = require('mongoose').model('Ad');
const Utils = require('./../utilities/utils');

module.exports = {
    index: (req, res) => {
        res.render('category/index');
    },
    category: (req, res) => {
        let id = req.params.id;
        Ad.find({category: id})
            .sort({date: 'desc'})
            .populate('town author category')
            .then(ads => {
            let categoryName = '';
            if (ads[0]) {
                categoryName = ads[0].category.name;
            }

            res.render('category/index', {ads: Utils.adsReformat(ads), categoryName: categoryName})
        });
    }

};
