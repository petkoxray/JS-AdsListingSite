const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const adController = require('./../controllers/ad')
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

    app.get('/user/details', userController.detailsGet);
    app.post('/user/details', userController.detailsPost);

    app.get('/user/ads', userController.myAdsGet);

    app.get('/ad/create', adController.createGet);
    app.post('/ad/create', adController.createPost);

    app.get('/ad/details/:id', adController.detailsGet);

    app.get('/ad/edit/:id', adController.editGet);
    app.post('/ad/edit/:id', adController.editPost);

    app.get('/ad/delete/:id', adController.deleteGet);
    app.post('/ad/delete/:id', adController.deletePost);

    app.get('/category', categoryController.index);
    app.get('/category/:id', categoryController.category);

    app.get('/town', townController.index);
    app.get('/town/:id', townController.town);

    app.get('/admin', adminController.index);
    app.get('/admin/ads', adminController.adsGet);

    app.get('/admin/categories', adminController.categoriesGet);
    app.post('/admin/categories', adminController.categoriesPost);

    app.get('/admin/towns', adminController.townsGet);
    app.post('/admin/towns', adminController.townsPost);

    app.get('/admin/users', adminController.usersGet);

};

