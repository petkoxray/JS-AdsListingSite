const Category = require('mongoose').model('Category');
const Town = require('mongoose').model('Town');
const Ad = require('mongoose').model('Ad');
const Comment = require('mongoose').model('Comment');
const randomString = require('randomstring');
const Utils = require('./../utilities/utils');
let towns;
let categories;

module.exports = {
  indexGet: (req, res) => {
    Ad.find({})
      .populate('author category town')
      .then(ads => {
        Utils.adsReformat(ads);
        res.render('ad/index', { ads: ads });
      });
  },

  indexPost: (req, res) => {
    let filter = req.body.option;
    let search = Utils.searchReformat(req.body.search);
    if (filter === 'town') {
      Town.findOne({ name: search })
        .populate({ path: 'ads', populate: { path: 'author category town' } })
        .then(town => {
          if (town) {
            let ads = town.ads;
            if (ads.length > 0) {
              res.render('ad/index', { ads: Utils.adsReformat(ads) });
            } else {
              let error = `Sorry we didnt find ads in ${town.name}`;
              res.render('ad/index', { error: error });
            }
          } else {
            let error = 'Sorry we didnt find ads that much your search';
            res.render('ad/index', { error: error })
          }
        });
    } else {
      Category.findOne({ name: search })
        .populate({ path: 'ads', populate: { path: 'author category town' } })
        .then(category => {
          if (category) {
            let ads = category.ads;
            if (ads.length > 0) {
              res.render('ad/index', { ads: Utils.adsReformat(ads) });
            } else {
              let error = `Sorry we didnt find ads in ${category.name} category`;
              res.render('ad/index', { error: error });
            }
          } else {
            let error = 'Sorry we didnt find ads that much your search';
            res.render('ad/index', { error: error });
          }
        });
    }
  },

  createGet: (req, res) => {
    Category.find({}).then(c => {
      categories = c;
      Town.find({}).then(t => {
        towns = t;
        res.render('ad/create', { categories: c, towns: t });
      });
    });
  },

  createPost: (req, res) => {
    let adArgs = req.body;
    let regexPrice = /^[0-9.,]+$/;
    let regexPhone = /^0[89]{1}[0-9]{8}$/;
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
      let filename = filenameAndExt.substr(0, index);
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
    adArgs.comments = [];

    Ad.create(adArgs).then(ad => {
      ad.createAd();
      res.redirect('/ad/details/' + ad.id);
    });
  },

  detailsGet: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).populate('author category town comments').then(ad => {
      if (!req.user) {
        res.render('ad/details', { ad: ad, isUserAuthorized: false, error: req.session.error });
        delete req.session.error;
        return;
      }

      req.user.isInRole('Admin').then(isAdmin => {
        let isUserAuthorized = isAdmin || req.user.isAuthor(ad);
        res.render('ad/details', { ad: ad, isUserAuthorized: isUserAuthorized, error: req.session.error });
        delete req.session.error;
      });
    });
  },

  detailsPost: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).then(ad => {
      if (!req.isAuthenticated()) {
        res.redirect('/')
      }

      let content = req.body.comment;

      if (content) {
        Comment.create({ username: req.user.username, content: content, ad: ad.id })
          .then(comment => {
            ad.comments.push(comment);
            ad.save(err => {
              if (err) console.log(err);
            });
            res.redirect('/ad/details/' + ad.id);
          });
      } else {
        req.session.error = 'You should write something';
        res.redirect('/ad/details/' + ad.id);
      }
    });
  },

  editGet: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).populate('author category town').then(ad => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (isAdmin || req.user.isAuthor(ad)) {
          res.render('ad/edit', { ad: ad, error: req.session.error });
          delete req.session.error;
          return;
        }

        res.redirect('/');
      });
    });
  },

  editPost: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).populate('author').then(ad => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (isAdmin || req.user.isAuthor(ad)) {
          let adArgs = req.body;
          let regexPrice = /^[0-9.,]+$/;
          let regexPhone = /^0[89]{1}[0-9]{8}$/;
          let errorMsg = '';

          if (!adArgs.title) {
            errorMsg = 'Ad title cannot be empty!';
          } else if (!adArgs.content) {
            errorMsg = 'Ad content cannot be empty!';
          } else if (!adArgs.phone || !regexPhone.test(adArgs.phone)) {
            errorMsg = 'Phone must be valid';
          } else if (!adArgs.price || !regexPrice.test(adArgs.price)) {
            errorMsg = 'Price must be valid';
          }

          if (errorMsg) {
            req.session.error = errorMsg;
            res.redirect(`/ad/edit/${id}`);
          } else {
            Ad.update({ _id: id },
              {
                $set: {
                  title: adArgs.title,
                  price: adArgs.price,
                  content: adArgs.content,
                  phone: adArgs.phone
                }
              })
              .then(updateStatus => {
                res.redirect(`/ad/details/${id}`);
              });
          }
          return;
        }
        res.redirect('/');
      });
    });
  },

  deleteGet: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).populate('author category town').then(ad => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (isAdmin || req.user.isAuthor(ad)) {
          res.render('ad/delete', ad);
          return;
        }
        res.redirect('/');
      });
    });
  },

  deletePost: (req, res) => {
    let id = req.params.id;

    Ad.findById(id).populate('author').then(ad => {
      req.user.isInRole('Admin').then(isAdmin => {
        if (isAdmin || req.user.isAuthor(ad)) {
          Ad.findByIdAndRemove(id).then(ad => {
            ad.deleteAd();
            res.redirect('/');
          });
        }
      });
    });
  },
};





















