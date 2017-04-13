const Category = require('mongoose').model('Category');
const Town = require('mongoose').model('Town');
const Ad = require('mongoose').model('Ad');
const randomString = require('randomstring');

let towns = '';
let categories = '';

module.exports = {
    createGet: (req, res) => {
        Category.find({}).then(c => {
            categories = c;
            Town.find({}).then(t => {
                towns = t;
                res.render('ad/create', {categories: c, towns: t});
            })
        })
    },

    createPost: (req, res) => {
        let adArgs = req.body;
        let regexPrice = /[0-9.,]/;
        let regexPhone = /^0[89]{1}[0-9]{8}$/gm;
        let errorMsg = '';

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to create Ads!';
        } else if (!adArgs.title) {
            errorMsg = 'Invalid title';
        } else if (!adArgs.content) {
            errorMsg = 'Invalid content';
        } else if (!adArgs.phone || !regexPhone.test(adArgs.phone)) {
            errorMsg = 'Phone should be valid Bulgarian mobile number';
        } else if (!adArgs.price || !regexPrice.test(adArgs.price)) {
            errorMsg = 'Price should be valid';
        }

        if (errorMsg) {
            res.render('ad/create', { error: errorMsg, categories: categories, towns: towns });
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
            Town.findOne({name: adArgs.town}).then(town => {
                adArgs.category = cat.id;
                adArgs.town = town.id;
                Ad.create(adArgs).then( ad => {
                    cat.ads.push(ad.id);
                    cat.save(err => {
                        if (err) console.log(err);
                    });
                    town.ads.push(ad.id);
                    town.save(err => {
                        if (err) console.log(err);
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

        Ad.findById(id).populate('author category town').then( ad => {
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

        Ad.findById(id).populate('author category town').then( ad => {
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

        Ad.findByIdAndRemove(id).populate('author category town').then(ad => {
            let author = ad.author;
            let category = ad.category;
            let town = ad.town;
            let authorIndex = author.ads.indexOf(ad.id);
            let categoryIndex = category.ads.indexOf(ad.id);
            let townIndex = town.ads.indexOf(ad.id);
            let errMsg = '';

            if (authorIndex < 0) {
                errMsg = 'Ad was not found for author';
                res.render('ad/delete', {error: errMsg})
            } else if (townIndex < 0) {
                errMsg = 'Ad was not found for town';
                res.render('ad/delete', {error: errMsg})
            } else if (categoryIndex < 0) {
                errMsg = 'Ad was not found for category';
                res.render('ad/delete', {error: errMsg})
            } else {
                category.ads.splice(categoryIndex,1);
                category.save(err => {
                    if (err) console.log(err);
                });
                town.ads.splice(townIndex,1);
                town.save(err => {
                    if (err) console.log(err);
                });
                author.ads.splice(authorIndex, 1);
                author.save().then(() => {
                    res.redirect('/');
                })
            }
        })
    },

}














