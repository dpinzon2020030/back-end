const router = require('express').Router();

const exchangeRatesController = require('../controllers/exchangeRates.controller');

router.get('/exchange-rates/symbols', exchangeRatesController.getSymbols);
router.get('/exchange-rates/latest', exchangeRatesController.getLatest);

module.exports = router;
