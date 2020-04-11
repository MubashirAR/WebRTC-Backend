const mongoose = require('mongoose');
let userSchema = mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true
  },
  salt: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  hash: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  email: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true
  },
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});
module.exports = mongoose.model('User', userSchema);