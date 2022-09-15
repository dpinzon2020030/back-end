const router = require('express').Router();

const usersController = require('../controllers/users.controller');

router.get('/users', usersController.getUsers);
router.post('/users', usersController.createUser);
router.get('/users/:id', usersController.getUser);
router.patch('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);
router.post('/users-admin', usersController.createUserAdmin);

module.exports = router;
