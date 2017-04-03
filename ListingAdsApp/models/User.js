const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const ObjectId = mongoose.Schema.Types.ObjectId;
const encryption = require('./../utilities/encryption');


let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        salt: {type: String, required: true},
        ads: [{type: ObjectId, ref: 'Ad'}],
        roles: [{type: ObjectId, ref: 'Role'}]
    }
);

userSchema.method ({
   authenticate: function (password) {
       let inputPasswordHash = encryption.hashPassword(password, this.salt);
       let isSamePasswordHash = inputPasswordHash === this.passwordHash;

       return isSamePasswordHash;
   }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.initialize =  () => {
    let email = 'admin@abv.bg';

    User.findOne({email: email}).then(admin => {
        if (admin) {
            console.log('Admin is already created!');
        } else {
            Role.findOne({name: 'Admin'}).then(role => {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword('pass', salt);

                let adminUser = {
                    email: email,
                    fullName: 'Admin Adminov',
                    salt: salt,
                    passwordHash: passwordHash,
                    ads: [],
                    roles: [role.id]
                };

                User.create(adminUser).then(adminUser => {
                    role.users.push(adminUser.id);
                    role.save(err => {
                        if (err) {
                            console.log('Admin user error!')
                        } else {
                            console.log('Admin seeded successfully!')
                        }
                    })
                })
            })
        }
    })
}


