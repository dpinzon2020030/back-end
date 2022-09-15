const router = require('express').Router();

const accountsController = require('../controllers/accounts.controller');

router.get('/accounts', accountsController.getAccounts);
router.post('/accounts', accountsController.createAccount);
router.get('/accounts/:id', accountsController.getAccount);
router.patch('/accounts/:id', accountsController.updateAccount);
router.delete('/accounts/:id', accountsController.deleteAccount);
router.get('/accounts/validate/:code', accountsController.validateAccount);
router.get('/accounts-by-owner/:id', accountsController.getAccountsByOwnerId);
router.get('/account-by-code/:code', accountsController.getAccountByCode);

module.exports = router;
