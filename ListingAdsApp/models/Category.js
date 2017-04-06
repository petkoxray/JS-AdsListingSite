const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

function initializeCategory(categoryName) {
    let categoryData = {name: categoryName};
    Category.findOne(categoryData).then(category => {
        if (!category) {
            Category.create(categoryData);
        }
    });
}

let categorySchema = mongoose.Schema (
    {
        name: {type: String, required:true},
        ads: [{type: ObjectId, ref: 'Ad'}]
    }
);

let Category = mongoose.model('Category', categorySchema);

module.exports = Category;

module.exports.initialize = () => {
    initializeCategory('Phones');
    initializeCategory('Laptops');
    initializeCategory('Computers');
    initializeCategory('Tablets');
    initializeCategory('Drones');
    initializeCategory('Cameras');
};