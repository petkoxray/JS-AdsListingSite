const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let adSchema = mongoose.Schema (
    {
        author: {type: ObjectId, ref: 'User'},
        title: {type: String, required: true },
        content: {type: String, required: true },
        phone: {type: Number, required: true },
        date: {type: Date, default: Date.now() }
    }
);

let Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;