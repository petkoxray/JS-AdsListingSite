const Ad = require('mongoose').model('Ad');
const Utils = require('./../utilities/utils');

module.exports = {
    index: (req, res) => {
        res.render('town/index')
    },

    town: (req, res) => {
        let townId = req.params.id;

        Ad.find({town: townId})
            .sort({date: 'desc'})
            .populate('author category town')
            .then(ads => {
            let townName = '';

            if (ads[0]) {
                townName = ads[0].town.name;
            }

            res.render('town/index', {ads: Utils.adsReformat(ads), townName: townName});
        });
    }
};

