const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

function initiliazeRole(roleName) {
    let roleData = {name: roleName};
    Role.findOne(roleData).then(role => {
        if (!role) {
            Role.create(roleData);
        }
    });
}

let roleSchema = mongoose.Schema (
    {
        name: { type: String, required: true, unique: true},
        users: [{type: ObjectId, ref: 'User'}]
    }
);

let Role = mongoose.model('Role',roleSchema);

module.exports.initialize = () => {
    initiliazeRole('User');
    initiliazeRole('Admin');
};