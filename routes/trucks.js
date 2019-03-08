const express = require('express');
const router = express.Router();

const TruckController = require('../controllers/TruckController')

router.get('/', TruckController.index);

router.get('/:id', TruckController.show);


module.exports = router