const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const adController = require('./../controllers/ad');
const categoryController = require('./../controllers/category');
const townController = require('./../controllers/town');
const adminController = require('./../controllers/admin/admin');

module.exports = (app) => {
  app.get('/', homeController.index);

  app.get('/user/register', userController.registerGet);
  app.post('/user/register', userController.registerPost);

  app.get('/user/login', userController.loginGet);
  app.post('/user/login', userController.loginPost);

  app.get('/user/logout', userController.logout);

  app.get('/user/details', authorize, userController.detailsGet);
  app.post('/user/details', authorize, userController.detailsPost);

  app.get('/user/myads', authorize, userController.myAdsGet);
  app.get('/user/ads/:id', userController.userAdsGet);

  app.get('/ad', adController.indexGet);
  app.post('/ad', adController.indexPost);

  app.get('/ad/create', adController.createGet);
  app.post('/ad/create', adController.createPost);

  app.get('/ad/details/:id', adController.detailsGet);
  app.post('/ad/details/:id', adController.detailsPost);

  app.get('/ad/edit/:id', authorize, adController.editGet);
  app.post('/ad/edit/:id', authorize, adController.editPost);

  app.get('/ad/delete/:id', authorize, adController.deleteGet);
  app.post('/ad/delete/:id', authorize, adController.deletePost);

  app.get('/category', categoryController.index);
  app.get('/category/:id', categoryController.category);

  app.get('/town', townController.index);
  app.get('/town/:id', townController.town);

  app.use((req, res, next) => {
    if (req.isAuthenticated()){
      req.user.isInRole('Admin').then(isAdmin=>{
        if(isAdmin){
          next();
        } else{
          res.redirect('/');
        }
      });
    } else {
      res.redirect('/user/login');
    }
  });

  app.get('/admin/ads', adminController.ads.adsGet);

  app.get('/admin/categories', adminController.category.categoriesGet);
  app.post('/admin/categories', adminController.category.categoriesPost);
  app.get('/admin/category-edit/:id', adminController.category.categoryEditGet);
  app.post('/admin/category-edit/:id', adminController.category.categoryEditPost);
  app.get('/admin/category-delete/:id', adminController.category.categoryDeleteGet);
  app.post('/admin/category-delete/:id', adminController.category.categoryDeletePost);

  app.get('/admin/towns', adminController.town.townsGet);
  app.post('/admin/towns', adminController.town.townsPost);
  app.get('/admin/town-edit/:id', adminController.town.townEditGet);
  app.post('/admin/town-edit/:id', adminController.town.townEditPost);
  app.get('/admin/town-delete/:id', adminController.town.townDeleteGet);
  app.post('/admin/town-delete/:id', adminController.town.townDeletePost);

  app.get('/admin/users', adminController.user.usersGet);
  app.get('/admin/user-edit/:id', adminController.user.userEditGet);
  app.post('/admin/user-edit/:id', adminController.user.userEditPost);
  app.get('/admin/user-delete/:id', adminController.user.userDeleteGet);
  app.post('/admin/user-delete/:id', adminController.user.userDeletePost);

};

function authorize(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/user/login');
}
