const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const authValidateAccessResource = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/signup', authValidateAccessResource, authController.signup);
router.get('/accessResource', authController.accessResource);

module.exports = router;
