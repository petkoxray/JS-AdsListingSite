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

    Category.findOne({name: categoryArgs.name})
      .then(category => {
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

    Category.findOneAndRemove({_id: id}).then(category => {
      category.deleteCategory();
      res.redirect('/admin/categories');
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

    Category.findOne({name: name})
      .then(category => {
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

    Town.findOneAndRemove({_id: id}).then(town => {
      town.deleteTown();
      res.redirect('/admin/towns');
    });
  },

  usersGet: (req, res) => {
    User.find({}).sort({date: 'desc'}).populate('ads').then(users => {
      res.render('admin/users', {users: users});
    });
  },

  userEditGet: (req, res) => {
    let userId = req.params.id;

    User.findOne({_id: userId})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(user => {
        res.render('admin/user-edit', {user: user, ads: user.ads});
      });
  },

  userEditPost: (req, res) => {
    let id = req.params.id;
    let fullName = req.body.fullName;

    User.update({_id: id}, {$set: {fullName: fullName}})
      .then(updateStatus => {
        res.redirect('/admin/user-edit/' + id);
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

    User.findOneAndRemove({_id: id}).then(user => {
      user.deleteUser();
      res.redirect('/admin/users');
    })
  },
};