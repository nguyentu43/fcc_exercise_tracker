const mongoose = require('mongoose');
const shortid = require('shortid');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  _id: {
    'type': String,
    'default': shortid.generate
  }
});

module.export = mongoose.model('User', userSchema);