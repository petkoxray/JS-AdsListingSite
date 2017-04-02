const Ad = require('mongoose').model('Ad');

module.exports = {
    createGet: (req, res) => {
        res.render('ad/create');
    },

    createPost: (req, res) => {
        let adArgs = req.body;

        let errorMsg = '';

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to create Ads!'
        } else if (!adArgs.title) {
            errorMsg = 'Invalid title'
        } else if (!adArgs.content) {
            errorMsg = 'Invalid content'
        } else if (!adArgs.phone) {
            errorMsg = 'Invalid phone number'
        }

        if (errorMsg) {
            res.render('ad/create', { error: errorMsg })
            return;
        }

        adArgs.author = req.user.id;

        Ad.create(adArgs).then( ad => {
            req.user.ads.push(ad.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {err: err.message})
                } else {
                    res.redirect('/')
                }
            })
        })

    },

    detailsGet: (req, res) => {
        let id = req.params.id;

        Ad.findById(id).populate('author').then( ad => {
            res.render('ad/details', ad)
        })
    },

    editGet: (req ,res) => {
        let id = req.params.id;

        Ad.findById(id).populate('author').then( ad => {
            res.render('ad/edit', ad)
        })
    },

    editPost: (req, res) => {
        let id = req.params.id;
        let adArgs = req.body;
        let errorMsg = '';

        if (!adArgs.title) {
            errorMsg = 'Ad title cannot be empty!'
        } else if (!adArgs.content) {
          errorMsg = 'Ad content cannot be empty!'
        } else if (!adArgs.phone) {
            errorMsg = 'Phone must be valid'
        }

        if (errorMsg) {
            res.render('ad/edit', {error: errorMsg})
        } else {
            Ad.update({_id: id},
                {$set:
                    {title: adArgs.title, content: adArgs.content, phone: adArgs.phone}})
                .then(updateStatus => {
                    res.redirect(`/ad/details/${id}`)
                })
        }
    },

}


