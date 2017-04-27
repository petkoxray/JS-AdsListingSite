let mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let commentSchema = mongoose.Schema(
  {
    username: {type: String, required: true},
    content: {type: String, required: true},
    ad: {type: ObjectId, required: true},
    date: {type: Date, default: Date.now()}
  }
);

commentSchema.set('versionKey', false);

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;