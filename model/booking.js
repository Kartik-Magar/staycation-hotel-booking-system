const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  homeId: { type: mongoose.Schema.Types.ObjectId, ref: "Home", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema);
