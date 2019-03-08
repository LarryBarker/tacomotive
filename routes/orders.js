const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/OrderController')


router.get('/', OrderController.index);
router.get('/:id', OrderController.show);

router.post('/', OrderController.create);

router.post('/items', OrderController.update);

router.get('/items/remove/:id', OrderController.delete)
router.get('/items/add/:id', OrderController.add)

module.exports = router