const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// order item schema
const OrderItemSchema = new Schema({
    id: String,
    name: String,
    description: String,
    price: String,
    truck: String,
    quantity: Number,
});

module.exports = OrderItem = mongoose.model('orderItems', OrderItemSchema);