const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// menu item schema
const MenuItemSchema = new Schema({
    category: String,
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
}, {strict: false});

module.exports = MenuItem = mongoose.model('menuItems', MenuItemSchema);