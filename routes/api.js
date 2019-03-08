const express = require('express');
const router = express.Router();



const TruckController = require('../controllers/TruckController');
// get a list of trucks
router.get('/trucks', TruckController.index);

// return a single truck
router.get('/trucks/:id', TruckController.show);

const AdminController = require('../controllers/AdminController');
// list all orders
router.get('/orders', AdminController.orders)


const CustomerController = require('../controllers/CustomerController');
// list all customers
router.get('/customers', CustomerController.index)

router.get('*', (req, res) => {
    // return res.send('hello from api');
    res.format({
        'application/json': () => {
            res.json('Method not supported.');
        },
        'application/xml': () => {
            let message = "\n<?xml version='1.0'?>\n" +
                "<message>Method not supported.</message>"

            res.type('application/xml');
            res.send(message);
        },
        'text/plain': () => {
            res.send('Method not supported.');
        }
    });
})

module.exports = router;