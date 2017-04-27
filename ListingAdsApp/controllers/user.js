const User = require('mongoose').model('User');
const Ad = require('mongoose').model('Ad');
const Utils = require('./../utilities/utils');
const encryption = require('./../utilities/encryption');

module.exports = {
  registerGet: (req, res) => {
    res.render('user/register');
  },

  registerPost: (req, res) => {
    let registerArgs = req.body;

    User.findOne({email: registerArgs.email}).then(user => {
      let errorMsg = '';
      if (user) {
        errorMsg = 'User with the same username exists!';
      } else if (registerArgs.password !== registerArgs.repeatedPassword) {
        errorMsg = 'Passwords do not match!'
      }

      if (errorMsg) {
        registerArgs.error = errorMsg;
        res.render('user/register', registerArgs)
      } else {
        let salt = encryption.generateSalt();
        let passwordHash = encryption.hashPassword(registerArgs.password, salt);
        let roles = ['User'];

        let userObject = {
          email: registerArgs.email,
          passwordHash: passwordHash,
          fullName: registerArgs.fullName,
          salt: salt,
          roles: roles
        };
        User.create(userObject).then(user => {
          req.logIn(user, (err) => {
            if (err) {
              registerArgs.error = err.message;
              res.render('user/register', registerArgs);
              return;
            }

            res.redirect('/');
          });
        });
      }
    });
  },

  loginGet: (req, res) => {
    res.render('user/login');
  },

  loginPost: (req, res) => {
    let loginArgs = req.body;
    User.findOne({email: loginArgs.email}).then(user => {
      if (!user || !user.authenticate(loginArgs.password)) {
        let errorMsg = 'Either username or password is invalid!';
        loginArgs.error = errorMsg;
        res.render('user/login', loginArgs);
        return;
      }

      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          res.redirect('/user/login', {error: err.message});
          return;
        }

        res.redirect('/');
      });
    });
  },

  logout: (req, res) => {
    req.logOut();
    res.redirect('/');
  },

  detailsGet: (req, res) => {
    res.render('user/details', {user: req.user});
  },

  detailsPost: (req, res) => {
    let id = req.user.id;
    let userArgs = req.body;

    User.update({_id: id}, {$set: {fullName: userArgs.fullName}})
      .then(updateStatus => {
        res.redirect('/user/details/')
      });
  },

  myAdsGet: (req, res) => {
    Ad.find({author: req.user.id})
      .populate('author category town')
      .then(ads => {
        Utils.adsReformat(ads);
        res.render('user/myads', {ads: ads})
      });
  },

  userAdsGet: (req, res) => {
    let id = req.params.id;

    Ad.find({author: id})
      .populate('author category town')
      .then(ads => {
        Utils.adsReformat(ads);
        res.render('user/ads', {ads: ads})
      });
  }
};
