const User = require('mongoose').model('User');
const Role = require('mongoose').model('Role');
const Ad = require('mongoose').model('Ad');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost:(req, res) => {
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
                let roles = [];
                Role.findOne({name: 'User'}).then(role => {
                    roles.push(role.id);
                    let userObject = {
                        email: registerArgs.email,
                        passwordHash: passwordHash,
                        fullName: registerArgs.fullName,
                        salt: salt,
                        roles: roles
                    };
                    User.create(userObject).then(user => {
                        role.users.push(user.id);
                        role.save(err => {
                            if (err) {
                                res.render('user/register', {error: err.message})
                            } else {
                                req.logIn(user, (err) => {
                                    if (err) {
                                        registerArgs.error = err.message;
                                        res.render('user/register', registerArgs);
                                        return;
                                    }

                                    res.redirect('/');
                                });
                            }

                        });
                    })
                });

            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
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
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },

    detailsGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        req.user.isInRole('Admin').then(isAdmin => {
            res.render('user/details', {user: req.user, isAdmin: isAdmin});
        });
    },

    detailsPost: (req , res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        let id = req.user.id;
        let userArgs = req.body;

        User.update({_id: id},{$set: {fullName: userArgs.fullName}})
            .then(updateStatus => {
                res.redirect('/user/details/')
            })
    },

    myAdsGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        Ad.find({author: req.user.id}).populate('ads category town').then(ads => {
            ads.forEach(ads => {
                ads.content = ads.content.substr(0, 40) + '...';
            });
            res.render('user/myads', {ads: ads})
        })
    }

};
