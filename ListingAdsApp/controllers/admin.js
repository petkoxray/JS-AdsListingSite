const mongoose = require('mongoose');

module.exports = {
    index: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        req.user.isInRole('Admin').then(isAdmin => {
            if (!isAdmin) {
                res.redirect('/');
                return;
            }
            res.render('admin/index');
        })
    },

};