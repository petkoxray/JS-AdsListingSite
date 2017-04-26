const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const Category = mongoose.model('Category');
const Town = mongoose.model('Town');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
const Comment = mongoose.model('Comment');

module.exports = {
  index: (req, res) => {
    res.render('admin/index');
  },

  adsGet: (req, res) => {
    Ad.find({})
      .sort({date: 'desc'})
      .populate('author category town comments')
      .then(ads => {
        ads.forEach(ads => {
          ads.title = ads.title.substr(0, 10) + '...';
        });
        res.render('admin/ads', {ads: ads});
      });
  },

  categoriesGet: (req, res) => {
    Category.find({}).sort({date: 'desc'})
      .populate('ads')
      .then(categories => {
        res.render('admin/categories',
          {categories: categories, error: req.session.error});
        delete req.session.error;
      });
  },

  categoriesPost: (req, res) => {
    let categoryArgs = req.body;
    let regexCat = /^[A-Z][a-z\s]+$/;
    let errMsg = '';

    Category.findOne({name: categoryArgs.name}).then(category => {
      if (category || !categoryArgs.name || !regexCat.test(categoryArgs.name)) {
        errMsg = 'Category name is invalid or category with that name already exists!';
        req.session.error = errMsg;
        res.redirect('categories');
      } else {
        Category.create(categoryArgs).then(cat => {
          res.redirect('categories');
        });
      }
    });
  },

  categoryDeleteGet: (req, res) => {
    let id = req.params.id;

    Category.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(category => {
        let ads = category.ads;
        res.render('admin/category-delete', {category: category, ads: ads});
      });
  },

  categoryDeletePost: (req, res) => {
    let id = req.params.id;

    Category.findByIdAndRemove(id).populate('ads').then(category => {
      let ads = category.ads;
      if (ads.length !== 0) {
        ads.forEach(ad => {
          Ad.findByIdAndRemove(ad.id)
            .populate('author town comments')
            .then(ad => {
              let author = ad.author;
              let comments = ad.comments;
              let town = ad.town;
              let authorIndex = author.ads.indexOf(ad.id);
              let townIndex = town.ads.indexOf(ad.id);

              comments.forEach(comment => {
                Comment.findByIdAndRemove(comment.id).then(update => {
                });
              });
              town.ads.splice(townIndex, 1);
              town.save(err => {
                if (err) console.log(err);
              });
              author.ads.splice(authorIndex, 1);
              author.save().then(() => {
                res.redirect('/admin/categories');
              });
            });
        });
      } else {
        res.redirect('/admin/categories');
      }
    });
  },

  categoryEditGet: (req, res) => {
    let id = req.params.id;

    Category.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(category => {
        let ads = category.ads;
        res.render('admin/category-edit', {category: category, ads: ads, error: req.session.error});
        delete req.session.error;
      });
  },

  categoryEditPost: (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    Category.findOne({name: name}).then(category => {
      let regexCategory = /^[A-Z][a-z\s]+$/;
      if (category || !regexCategory.test(name)) {
        req.session.error = 'Category with that name already exist or category name is invalid!';
        res.redirect(`/admin/category-edit/${id}`);
      } else {
        Category.update({_id: id}, {$set: {name: name}}).then(category => {
          res.redirect('/admin/category-edit/' + id);
        });
      }
    });
  },

  townsGet: (req, res) => {
    Town.find({}).sort({date: 'desc'}).populate('ads').then(towns => {
      res.render('admin/towns', {towns: towns, error: req.session.error});
      delete req.session.error;
    });
  },

  townsPost: (req, res) => {
    let townArgs = req.body;
    let regexTown = /^[A-Z][a-z\s]+$/;
    let errMsg = '';

    Town.findOne({name: townArgs.name}).then(town => {
      if (town || !townArgs.name || !regexTown.test(townArgs.name)) {
        errMsg = 'Town name is invalid or town with that name already exist!';
        req.session.error = errMsg;
        res.redirect('towns');
      } else {
        Town.create(townArgs).then(town => {
          res.redirect('towns');
        });
      }
    });
  },

  townEditGet: (req, res) => {
    let id = req.params.id;

    Town.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(town => {
        let ads = town.ads;
        res.render('admin/town-edit', {town: town, ads: ads, error: req.session.error});
        delete req.session.error;
      });
  },

  townEditPost: (req, res) => {
    let id = req.params.id;
    let name = req.body.name;

    Town.findOne({name: name}).then(town => {
      let regexTown = /^[A-Z][a-z\s]+$/;
      if (town || !regexTown.test(name)) {
        req.session.error = 'Town with that name already exist or town name is invalid!';
        res.redirect(`/admin/town-edit/${id}`);
      } else {
        Town.update({_id: id}, {$set: {name: name}}).then(town => {
          res.redirect('/admin/town-edit/' + id);
        });
      }
    });
  },

  townDeleteGet: (req, res) => {
    let id = req.params.id;

    Town.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(town => {
        let ads = town.ads;
        res.render('admin/town-delete', {town: town, ads: ads});
      });
  },

  townDeletePost: (req, res) => {
    let id = req.params.id;

    Town.findByIdAndRemove(id)
      .populate('ads')
      .then(town => {
        let ads = town.ads;
        if (ads.length === 0) {
          res.redirect('/admin/towns');
          return;
        }

        ads.forEach(ad => {
          Ad.findByIdAndRemove(ad.id)
            .populate('author category comments')
            .then(ad => {
              let author = ad.author;
              let category = ad.category;
              let comments = ad.comments;
              let authorIndex = author.ads.indexOf(ad.id);
              let categoryIndex = category.ads.indexOf(ad.id);

              comments.forEach(comment => {
                Comment.findByIdAndRemove(comment.id).then(update => {
                });
              });
              category.ads.splice(categoryIndex, 1);
              category.save(err => {
                if (err) console.log(err);
              });
              author.ads.splice(authorIndex, 1);
              author.save().then(() => {
                res.redirect('/admin/towns');
              });
            });
        });
      });
  },

  usersGet: (req, res) => {
    User.find({}).sort({date: 'desc'}).populate('ads').then(users => {
      res.render('admin/users', {users: users});
    });
  },

  userDeleteGet: (req, res) => {
    User.findOne({_id: req.params.id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(user => {
        res.render('admin/user-delete', {user: user, ads: user.ads});
      });
  },

  userDeletePost: (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id)
      .populate('ads roles')
      .then(user => {
        let roles = user.roles;
        roles.forEach(role => {
          let roleIndex = role.users.indexOf(user.id);
          role.users.splice(roleIndex, 1);
          role.save(err => {
            if (err) {
              console.log(err);
            }
          });
        });
        let ads = user.ads;
        if (ads.length !== 0) {
          ads.forEach(ad => {
            Ad.findByIdAndRemove(ad.id)
              .populate('category town comments')
              .then(ad => {
                let town = ad.town;
                let category = ad.category;
                let comments = ad.comments;
                let townIndex = town.ads.indexOf(ad.id);
                let categoryIndex = category.ads.indexOf(ad.id);

                comments.forEach(comment => {
                  Comment.findByIdAndRemove(comment.id).then(update => {
                  });
                });
                category.ads.splice(categoryIndex, 1);
                category.save(err => {
                  if (err) console.log(err);
                });
                town.ads.splice(townIndex, 1);
                town.save().then(() => {
                  res.redirect('/admin/users');
                });
              });
          });
        } else {
          res.redirect('/admin/users');
        }
      });
  },
};