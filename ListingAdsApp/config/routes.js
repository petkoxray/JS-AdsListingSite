const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const adController = require('./../controllers/ad')

module.exports = (app) => {
    app.get('/', homeController.index);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/ad/create', adController.createGet);
    app.post('/ad/create', adController.createPost);
    app.get('/ad/details/:id', adController.detailsGet);

};

