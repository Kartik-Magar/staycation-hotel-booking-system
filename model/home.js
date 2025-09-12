const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  description: String,
});

module.exports = mongoose.model("Home", homeSchema);
// save()
// find()
// findById(homeId)
// deleteById(homeId)
