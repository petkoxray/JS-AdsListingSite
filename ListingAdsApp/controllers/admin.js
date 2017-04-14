const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const Category = mongoose.model('Category');
const Town = mongoose.model('Town');
const User = mongoose.model('User');

module.exports = {
    index: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }
            res.render('admin/index');
        })
    },

    adsGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }

            Ad.find({}).sort({date: 'desc'}).populate('author category town').then(ads => {
                ads.forEach(ads => {
                    ads.title = ads.title.substr(0, 10) + '...';
                });
                res.render('admin/ads', { ads: ads})
            });
        })
    },

    categoriesGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }

            Category.find({}).sort({date: 'desc'}).populate('ads').then(categories => {
                res.render('admin/categories', { categories: categories, error: req.session.error})
                delete req.session.error;
            });
        })
    },

    categoriesPost: (req, res) => {
        let categoryArgs = req.body;
        let regexCat = /[A-Z][a-z\s]+/;
        let errMsg = '';

        if (!categoryArgs.name || !regexCat.test(categoryArgs.name)) {
            errMsg = 'Category name is invalid!';
            req.session.error = errMsg;
            res.redirect('categories');
            return;
        }

        Category.create(categoryArgs).then(cat => {
            res.redirect('categories')
        })

    },

    categoryDeleteGet: (req ,res) => {
       let id = req.params.id;

       Category.findOne({_id: id}).populate('ads').then(category => {
           res.render('admin/category-delete', {category: category})
       })
    },

    categoryDeletePost: (req, res) => {
        let id = req.params.id;
        Category.findByIdAndRemove(id).populate('ads').then(category => {
            let ads = category.ads;
            if (ads.length !== 0) {
                ads.forEach(ad => {
                    Ad.findByIdAndRemove(ad.id).populate('author town').then(ad => {
                        let author = ad.author;
                        let town = ad.town;
                        let authorIndex = author.ads.indexOf(ad.id);
                        let townIndex = town.ads.indexOf(ad.id);

                        town.ads.splice(townIndex,1);
                        town.save(err => {
                            if (err) console.log(err);
                        });
                        author.ads.splice(authorIndex, 1);
                        author.save().then(() => {
                            res.redirect('/admin/categories');
                        })
                    })
                });
            } else {
                res.redirect('/admin/categories');
            }
        })

    },


    townsGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }

            Town.find({}).sort({date: 'desc'}).populate('ads').then(towns => {
                res.render('admin/towns', { towns: towns, error: req.session.error});
                delete req.session.error;
            });
        })
    },

    townsPost: (req, res) => {
        let townArgs = req.body;
        let regexTown = /[A-Z][a-z\s]+/;
        let errMsg = '';

        if (!townArgs.name || !regexTown.test(townArgs.name)) {
            errMsg = 'Town name is invalid!';
            req.session.error = errMsg;
            res.redirect('towns');
            return;
        }

        Town.create(townArgs).then(town => {
            res.redirect('towns');
        })

    },

    townDeleteGet: (req , res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }

            let id = req.params.id;

            Town.findOne({_id: id}).populate('ads').then(town => {
                res.render('admin/town-delete', { town: town});
            });
        })
    },

    townDeletePost: (req, res) => {
        let id = req.params.id;
        Town.findByIdAndRemove(id).populate('ads').then(town => {
            let ads = town.ads;
            if (ads.length !== 0) {
                ads.forEach(ad => {
                    Ad.findByIdAndRemove(ad.id).populate('author category').then(ad => {
                        let author = ad.author;
                        let category = ad.category;
                        let authorIndex = author.ads.indexOf(ad.id);
                        let categoryIndex = category.ads.indexOf(ad.id);

                        category.ads.splice(categoryIndex,1);
                        category.save(err => {
                            if (err) console.log(err);
                        });
                        author.ads.splice(authorIndex, 1);
                        author.save().then(() => {
                            res.redirect('/admin/towns');
                        })
                    })
                });
            } else {
                res.redirect('/admin/towns');
            }
        })

    },

    usersGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }

            User.find({}).sort({date: 'desc'}).populate('ads').then(users => {
                res.render('admin/users', { users: users})
            });
        })
    },
};