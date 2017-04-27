const User = require('mongoose').model('User');
const encryption = require('../../utilities/encryption');

module.exports = {
  usersGet: (req, res) => {
    User.find({}).sort({date: 'desc'}).populate('ads').then(users => {
      res.render('admin/users', {users: users});
    });
  },

  userEditGet: (req, res) => {
    let userId = req.params.id;

    User.findOne({_id: userId})
      .then(user => {
        res.render('admin/user-edit', {user: user});
      });
  },

  userEditPost: (req, res) => {
    let id = req.params.id;
    let userArgs = req.body;

    User.findOne({email: userArgs.email, _id: {$ne: id}}).then(user => {
      let errorMsg = '';
      if (user) {
        errorMsg = 'User with the same email exists!';
      } else if (!userArgs.email) {
        errorMsg = 'Email cannot be empty!'
      } else if (!userArgs.fullName) {
        errorMsg = 'Name cannot be empty!'
      } else if (userArgs.password !== userArgs.confirmedPassword) {
        errorMsg = 'Passwords do not match!'
      }

      if (errorMsg) {
        userArgs.error = errorMsg;
        res.render('admin/user-edit', userArgs);
      } else {
        User.findOne({_id: id}).then(user => {
          user.email = userArgs.email;
          user.fullName = userArgs.fullName;

          let passwordHash = user.passwordHash;
          if (userArgs.password) {
            passwordHash = encryption.hashPassword(userArgs.password, user.salt);
          }

          user.passwordHash = passwordHash;

          user.save((err) => {
            if (err) {
              res.redirect('/');
            } else {
              res.redirect('/admin/users');
            }
          });
        });
      }
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