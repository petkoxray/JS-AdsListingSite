const Ad = require('mongoose').model('Ad');

module.exports= {
    index: (req, res) => {
        res.render('town/index')
    },

    town: (req, res) => {
        let townId = req.params.id;

        Ad.find({town: townId}).populate('author category town').then(ads => {
            let townName = '';

            if (ads[0]) {
                townName = ads[0].town.name;
            }

            ads.forEach(ads => {
                ads.content = ads.content.substr(0, 40) + '...';
            });

            res.render('town/index', {ads:ads, townName: townName});
        });
    }
};

