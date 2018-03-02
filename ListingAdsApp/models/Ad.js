const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let adSchema = mongoose.Schema(
  {
    author: { type: ObjectId, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: ObjectId, ref: 'Category', required: true },
    town: { type: ObjectId, ref: 'Town', required: true },
    comments: [{ type: ObjectId, ref: 'Comment' }],
    phone: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    price: { type: Number, required: true },
    imagePath: { type: String }
  }
);

adSchema.method({
  createAd: function () {
    let User = mongoose.model('User');
    User.findById(this.author).then(user => {
      user.ads.push(this.id);
      user.save();
    });

    let Category = mongoose.model('Category');
    Category.findById(this.category).then(category => {
      if (category) {
        category.ads.push(this.id);
        category.save();
      }
    });

    let Town = mongoose.model('Town');
    Town.findById(this.town).then(town => {
      if (town) {
        town.ads.push(this.id);
        town.save();
      }
    });

  },

  deleteAd: function () {
    let User = mongoose.model('User');
    User.findById(this.author).then(user => {
      if (user) {
        user.ads.remove(this.id);
        user.save();
      }
    });

    let Category = mongoose.model('Category');
    Category.findById(this.category).then(category => {
      if (category) {
        category.ads.remove(this.id);
        category.save();
      }
    });

    let Town = mongoose.model('Town');
    Town.findById(this.town).then(town => {
      if (town) {
        town.ads.remove(this.id);
        town.save();
      }
    });

    let Comment = mongoose.model('Comment');
    for (let comment of this.comments) {
      Comment.findByIdAndRemove(comment).then(comment => {
      });
    }
  },
});

let Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;