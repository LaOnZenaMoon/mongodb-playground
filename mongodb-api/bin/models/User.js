const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  name: {
    first: {type: String, required: true,},
    last: {type: String, required: true,},
  },
  age: {type: Number, index: true},
  email: String,
}, {timestamps: true});

const User = mongoose.model('user', UserSchema);

module.exports = {
  User,
}
