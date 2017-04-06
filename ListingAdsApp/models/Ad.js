const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let adSchema = mongoose.Schema (
    {
        author: {type: ObjectId, ref: 'User'},
        title: {type: String, required: true },
        content: {type: String, required: true },
        category: {type: ObjectId, ref: 'Category', required: true},
        phone: {type: Number, required: true },
        date: {type: Date, default: Date.now() },
        price: {type: Number, required:true},
        imagePath: {type: String}
    }
);

let Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;