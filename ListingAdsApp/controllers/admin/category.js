const Category = require('mongoose').model('Category');

module.exports = {
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
};