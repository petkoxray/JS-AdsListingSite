const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const ObjectId = mongoose.Schema.Types.ObjectId;
const encryption = require('./../utilities/encryption');


let userSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    salt: { type: String, required: true },
    ads: [{ type: ObjectId, ref: 'Ad' }],
    roles: [{ type: ObjectId, ref: 'Role' }]
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

  isInRole: function (roleName) {
    return Role.findOne({ name: roleName }).then(role => {
      if (!role) {
        return false;
      }

      let isInRole = this.roles.indexOf(role.id) !== -1;
      return isInRole;
    });
  },

  deleteUser: function () {
    for (let role of this.roles) {
      Role.findById(role).then(role => {
        role.users.remove(this.id);
        role.save();
      });
    }

    let Ad = mongoose.model('Ad');
    for (let ad of this.ads) {
      Ad.findById(ad).then(ad => {
        ad.deleteAd();
        ad.remove();
      });
    }
  },
});

userSchema.set('versionKey', false);

const User = mongoose.model('User', userSchema);

module.exports = User;

//Admin User
//Username: admin@abv.bg Password: 1234
module.exports.initialize = () => {
  let email = 'admin@abv.bg';

  User.findOne({ email: email }).then(admin => {
    if (admin) {
      console.log('Admin is already created!');
    } else {
      Role.findOne({ name: 'Admin' }).then(role => {

        if (!role) {
          return;
        }

        let salt = encryption.generateSalt();
        let passwordHash = encryption.hashPassword('1234', salt);

        let adminUser = {
          email: email,
          fullName: 'Admin Adminov',
          salt: salt,
          passwordHash: passwordHash,
          roles: [role.id],
          ads: []
        };

        User.create(adminUser).then(adminUser => {
          role.users.push(adminUser.id);
          role.save(err => {
            if (err) {
              console.log('Admin user error!')
            } else {
              console.log('Admin seeded successfully!')
            }
          });
        });
      });
    }
  });
};



