const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const adController = require('./../controllers/ad');
const categoryController = require('./../controllers/category');
const townController = require('./../controllers/town');
const adminController = require('./../controllers/admin');

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

  app.get('/admin', adminController.index);
  app.get('/admin/ads', adminController.adsGet);

  app.get('/admin/categories', adminController.categoriesGet);
  app.post('/admin/categories', adminController.categoriesPost);
  app.get('/admin/category-edit/:id', adminController.categoryEditGet);
  app.post('/admin/category-edit/:id', adminController.categoryEditPost);
  app.get('/admin/category-delete/:id', adminController.categoryDeleteGet);
  app.post('/admin/category-delete/:id', adminController.categoryDeletePost);

  app.get('/admin/towns', adminController.townsGet);
  app.post('/admin/towns', adminController.townsPost);
  app.get('/admin/town-edit/:id', adminController.townEditGet);
  app.post('/admin/town-edit/:id', adminController.townEditPost);
  app.get('/admin/town-delete/:id', adminController.townDeleteGet);
  app.post('/admin/town-delete/:id', adminController.townDeletePost);

  app.get('/admin/users', adminController.usersGet);
  app.get('/admin/user-edit/:id', adminController.userEditGet);
  app.post('/admin/user-edit/:id', adminController.userEditPost);
  app.get('/admin/user-delete/:id', adminController.userDeleteGet);
  app.post('/admin/user-delete/:id', adminController.userDeletePost);

};

function authorize(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/user/login');
}
