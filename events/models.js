"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const foodAndBevSchema = mongoose.Schema({
  type: String,
  pricePerOrder: Number,
  quantity: Number
});

const eventSchema = mongoose.Schema({
  user: { type: String },
  contact: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  date: Date,
  time: String,
  order: {
    food: [foodAndBevSchema],
    beverages: [foodAndBevSchema],
    rentalPrice: Number
  }
});

eventSchema.methods.serialize = function() {
  return {
    id: this._id,
    contact: this.contact,
    date: this.date,
    time: this.time,
    order: this.order
  };
};

const Events = mongoose.model("Events", eventSchema);

module.exports = { Events };
