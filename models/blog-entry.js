const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {type: String, required: true},
  date: {type: String, required: true},
  imagePath: {type: String, required: false},
  content: {type: String, required: true},
  excerpt: {type: String, required: false},
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {
  timestamps: true
});

const commentSchema = new Schema({
  user: {type: String, required: true},
  message: {
    type: String,
    required: true,
  },
  blogEntry: {type: Schema.Types.ObjectId, ref: 'BlogEntry'},
}, {
  timestamps: true
});

const BlogEntry = mongoose.model('BlogEntry', blogSchema);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = { BlogEntry, Comment };
