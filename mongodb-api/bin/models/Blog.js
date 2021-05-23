const {Schema, model, Types} = require("mongoose");

const BlogSchema = new Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  isLive: {type: Boolean, required: true, default: false},
  // ref: 'user' 는 const User = mongoose.model('user', UserSchema); model 의 'user' 와 같아야한다.
  user: {type: Types.ObjectId, required: true, ref: 'user'},
}, {timestamps: true});

const Blog = model('blog', BlogSchema);

module.exports = {Blog};
