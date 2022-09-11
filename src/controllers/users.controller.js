const users = require('../repository/users');

getUsers = async (req, res, next) => {
  const documents = await users.getAllUsers();

  res.json(documents);
};

createUser = async (req, res, next) => {
  const userTypeLogged = req.decodedToken.userType;

  if (userTypeLogged !== 'admin') {
    const message = 'User is not admin.';
    const error = new Error(message);

    res.status(401).json({
      success: false,
      message,
    });
    return next(error);
  }

  const data = req.body;
  const documents = await users.createUser(data);

  res.json(documents);
};

getUser = async (req, res, next) => {
  const id = req.params.id;
  const document = await users.getUser(id);

  res.json(document);
};

updateUser = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const documents = await users.updateUser(id, data);

  res.json(documents);
};

deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const result = await users.deleteUser(id);

  res.json(result);
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
