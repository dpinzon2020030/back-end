const accounts = require('../repository/accounts');

getAccounts = async (req, res, next) => {
  const documents = await accounts.getAllAccounts();

  res.json(documents);
};

createAccount = async (req, res, next) => {
  const userTypeLogged = req.decodedToken.userType;
  const userIdLogged = req.decodedToken.userId;
  console.log(`req.decodedToken`,req.decodedToken)

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
  const documents = await accounts.createAccount(userIdLogged, data);

  res.json(documents);
};

getAccount = async (req, res, next) => {
  const id = req.params.id;
  const document = await accounts.getAccount(id);

  res.json(document);
};

updateAccount = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const documents = await accounts.updateAccount(id, data);

  res.json(documents);
};

deleteAccount = async (req, res, next) => {
  const id = req.params.id;
  const result = await accounts.deleteAccount(id);

  res.json(result);
};

getAccountsByOwnerId = async (req, res, next) => {
  const id = req.params.id;
  const document = await accounts.getAccountByOwnerId(id);

  res.json(document);
};

getAccountByCode = async (req, res, next) => {
  const code = req.params.code;
  const document = await accounts.getAccountByCode(code);

  res.json(document);
};

module.exports = {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountsByOwnerId,
  getAccountByCode,
};
