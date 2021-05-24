const {Schema, model, Types} = require("mongoose");

const BlogSchema = new Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  isLive: {type: Boolean, required: true, default: false},
  // ref: 'user' 는 const User = mongoose.model('user', UserSchema); model 의 'user' 와 같아야한다.
  user: {type: Types.ObjectId, required: true, ref: 'user'},
  // comments: [{type: Types.ObjectId, required: true, ref: 'comment'}],
}, {timestamps: true});

BlogSchema.virtual('comments', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'blog',
})

BlogSchema.set('toObject', {virtuals: true});
BlogSchema.set('toJSON', {virtuals: true});

const Blog = model('blog', BlogSchema);

module.exports = {
  Blog,
}
