const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const TruckSchema = new Schema({
    _id: Number,
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'menus'
    },
});

module.exports = Truck = mongoose.model('trucks', TruckSchema);