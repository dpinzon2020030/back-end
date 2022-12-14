const users = require('../repository/users');
const bankingTransactions = require('../repository/bankingTransactions');

getUsers = async (req, res, next) => {
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

  const documents = await users.getAllUsers();

  res.json(documents);
};

createUser = async (req, res, next) => {
  let statusCode = 201;

  const userTypeLogged = req.decodedToken.userType;

  if (userTypeLogged !== 'admin') {
    const message = 'User is not admin.';
    const error = new Error(message);
    statusCode = 401;

    res.status(statusCode).json({
      success: false,
      message,
    });
    return next(error);
  }

  const data = req.body;

  if (!data.dpi) {
    const message = 'DPI Invalid.';
    const error = new Error(message);
    statusCode = 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
    return next(error);
  }

  const documents = await users.createUser(data);

  if (!documents.success) {
    statusCode = 400;
  }

  res.status(statusCode).json(documents);
};

getUser = async (req, res, next) => {
  const id = req.params.id;
  const document = await bankingTransactions.getUser(id);

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

createUserAdmin = async (req, res, next) => {
  const data = req.body;

  if (!data.dpi) {
    const message = 'DPI Invalid.';
    const error = new Error(message);

    res.status(400).json({
      success: false,
      message,
    });
    return next(error);
  }

  const documents = await users.createUser(data);

  res.json(documents);
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  createUserAdmin,
};
