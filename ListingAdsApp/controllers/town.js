const Ad = require('mongoose').model('Ad');

module.exports= {
    index: (req, res) => {
        res.render('town/index')
    },

    town: (req, res) => {
        let townId = req.params.id;

        Ad.find({town: townId}).populate('author category town').then(ads => {
            res.render('home/index', {ads:ads});
        })
    }
}

