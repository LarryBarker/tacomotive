const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        refs: 'users'
    },
    items: [
        {
            name: String,
            description: String,
            price: String,
            truck: String,
            quantity: Number,
        }
    ],
    totalItems: Number,
    total: Number,
    status: String,
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = Order = mongoose.model('orders', OrderSchema);