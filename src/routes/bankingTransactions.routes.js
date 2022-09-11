const router = require('express').Router();

const bankingTransactionsController = require('../controllers/bankingTransactions.controller');

router.get('/banking-transactions-by-account/:id', bankingTransactionsController.getTransactions);
router.post('/banking-transactions', bankingTransactionsController.createTransaction);
router.get('/banking-transactions/:id', bankingTransactionsController.getTransaction);

module.exports = router;
