const Category = require('mongoose').model('Category');
const Ad = require('mongoose').model('Ad');
const randomString = require('randomstring');

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
            res.render('ad/create', { error: errorMsg });
            return;
        }

        let image = req.files.image;

        if (image) {
            let filenameAndExt = image.name;
            let index = filenameAndExt.lastIndexOf('.');
            let filename = filenameAndExt.substr(0,index);
            let ext = filenameAndExt.substr(index);
            let finalName = filename + randomString.generate(7) + ext;

            image.mv(`./public/images/${finalName}`, err => {
                if (err) {
                    console.log(err.message);
                }
            });

            adArgs.imagePath = `/images/${finalName}`;
        }

        adArgs.author = req.user.id;

        Category.findOne({name: adArgs.category}).then(cat => {
            adArgs.category = cat.id;
            Ad.create(adArgs).then( ad => {
                cat.ads.push(ad.id);
                cat.save(err => {
                    if (err) {
                        console.log(err);
                    }
                });
                req.user.ads.push(ad.id);
                req.user.save(err => {
                    if (err) {
                        res.redirect('/', {err: err.message})
                    } else {
                        res.redirect('/')
                    }
                })
            })

        });
    },

    detailsGet: (req, res) => {
        let id = req.params.id;

        Ad.findById(id).populate('author').then( ad => {
            if (!req.user) {
                res.render('ad/details', {ad: ad, isUserAuthorized: false});
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(ad);
                res.render('ad/details', {ad: ad, isUserAuthorized: isUserAuthorized});
            });
        })
    },

    editGet: (req ,res) => {
        let id = req.params.id;
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        Ad.findById(id).populate('author').then( ad => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (isAdmin || req.user.isAuthor(ad)) {
                    res.render('ad/edit', ad);
                    return;
                }

                res.redirect('/');
            })
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
        } else if (!adArgs.price) {
            errorMsg = 'Price must be valid'
        } else if (!adArgs.price) {
            errorMsg = 'Phone must be valid'
        }

        if (errorMsg) {
            res.render('ad/edit', {error: errorMsg})
        } else {
            Ad.update({_id: id},
                {$set:
                    {title: adArgs.title, price: adArgs.price, content: adArgs.content, phone: adArgs.phone}})
                .then(updateStatus => {
                    res.redirect(`/ad/details/${id}`)
                })
        }
    },

    deleteGet: (req , res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        Ad.findById(id).populate('author').then( ad => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (isAdmin || req.user.isAuthor(ad)) {
                    res.render('ad/delete', ad);
                    return;
                }
                res.redirect('/');
            });
        })
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        Ad.findByIdAndRemove(id).populate('author').then(ad => {
            let author = ad.author;

            let index = author.ads.indexOf(ad.id);

            if (index < 0) {
                let errMsg = 'Ad was not found for author';
                res.render('ad/delete', {error: errMsg})
            } else {
                author.ads.splice(index, 1);
                author.save().then(() => {
                    res.redirect('/');
                })
            }
        })
    },

}









