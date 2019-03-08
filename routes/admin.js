var express = require('express');
var router = express.Router();

function adminOnly(req, res, next) {
    if(req.user && req.user.role === 'admin') return next();
    return res.render('admin/login', {layout: null});
}

// admin panel routes
const AdminController = require('../controllers/AdminController');
router.get('/', adminOnly, AdminController.index)

// customer management routes
const CustomerController = require('../controllers/CustomerController');
router.get('/customers', adminOnly, CustomerController.index);
router.get('/customers/:id/orders', adminOnly, CustomerController.orders);

// order routes
router.get('/orders', adminOnly, AdminController.orders);
router.get('/orders/:id', adminOnly, AdminController.order);
router.get('/orders/:id/process', adminOnly, AdminController.processOrder);

module.exports = router