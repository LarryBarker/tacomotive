const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MenuSchema = new Schema({
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'menuItems'
    }],
});

module.exports = Menu = mongoose.model('menus', MenuSchema);