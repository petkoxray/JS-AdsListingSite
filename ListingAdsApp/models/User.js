const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const encryption = require('./../utilities/encryption');


let userSchema = mongoose.Schema(
  {
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    fullName: {type: String, required: true},
    salt: {type: String, required: true},
    ads: [{type: ObjectId, ref: 'Ad'}],
    roles: [{type: String}]
  }
);

userSchema.method({
  authenticate: function (password) {
    let inputPasswordHash = encryption.hashPassword(password, this.salt);
    let isSamePasswordHash = inputPasswordHash === this.passwordHash;

    return isSamePasswordHash;
  },

  isAuthor: function (ad) {
    if (!ad) {
      return false;
    }

    let id = ad.author.id;

    return this.id === id;
  },

  isInRole: function (role) {
    return this.roles.indexOf(role) !== -1;
  },

  isAdmin: function () {
    return this.user.roles.indexOf('Admin') !== -1;
  },

});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.initialize = () => {
  let email = 'admin@abv.bg';

  User.findOne({email: email}).then(admin => {
    if (admin) {
      console.log('Admin is already created!');
    } else {
      let salt = encryption.generateSalt();
      let passwordHash = encryption.hashPassword('pass', salt);

      let adminUser = {
        email: email,
        fullName: 'Admin Adminov',
        salt: salt,
        passwordHash: passwordHash,
        ads: [],
        roles: ['Admin']
      };

      User.create(adminUser).then(adminUser => {
        console.log('Admin user created!');
      });
    }
  });
};



