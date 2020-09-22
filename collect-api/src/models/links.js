const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  }
})

mongoose.model('Link', LinkSchema);