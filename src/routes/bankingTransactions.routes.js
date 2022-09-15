const router = require('express').Router();

const bankingTransactionsController = require('../controllers/bankingTransactions.controller');

router.get('/banking-transactions-by-account/:id', bankingTransactionsController.getTransactions);
router.get('/banking-transactions-validate-debit/:id', bankingTransactionsController.validateDebit);
router.post('/banking-transactions', bankingTransactionsController.createTransaction);
router.get('/banking-transactions/:id', bankingTransactionsController.getTransaction);

module.exports = router;
