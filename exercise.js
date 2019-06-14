const mongoose = require('mongoose');
const shortid = require('shortid');

const exerciseSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  _id: {
    'type': String,
    'default': shortid.generate
  }
});

module.export = mongoose.model('Exercise', exerciseSchema);