const router = require('express').Router();

const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/accessResource', authController.accessResource);

module.exports = router;
