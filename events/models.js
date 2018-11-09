'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const foodAndBevSchema = mongoose.Schema({
    type: String, 
    pricePerOrder: Number,
    quantity: Number,
});

const eventSchema = mongoose.Schema({
    user: {type: String},
    contact: {
        firstName: String, 
        lastName: String, 
        email: String, 
        phone: String
    },
    date: String, 
    time: String, 
    order: {
        food: [foodAndBevSchema],
        beverages: [foodAndBevSchema],
        rentalPrice: Number
    }
});

// eventSchema.virtual('contactName').get(function(){
//     return `${this.contact.lastName}, ${this.contact.firstName}`.trim();
// })

// eventSchema.virtual('foodOrderCost').get(function(){
//     return `${this.order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b})}`;
// })

// eventSchema.virtual('beverageOrderCost').get(function(){
//     return `${this.order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b)=>{return a+b})}`;
// })

// eventSchema.virtual('orderTotal').get(function(){
//     return `${JSON.parse(this.beverageOrderCost) + JSON.parse(this.foodOrderCost) + (this.order.rentalPrice)}`;
// })

eventSchema.methods.serialize = function(){
    return {
        id: this._id,
        contact: this.contact, 
        date: this.date,
        time: this.time,
        order: this.order,
    }
}

// eventSchema.methods.fullReport = function(){
//     return {
//         id: this.id,
//         contact: this.contact,
//         date: this.date,
//         time: this.time,
//         order: this.order,
//         beverageTotalCost: this.beverageOrderCost,
//         foodTotalCost: this.foodOrderCost,
//         orderTotal: this.orderTotal
//     }
// }

const Events = mongoose.model('Events', eventSchema);

module.exports = {Events};