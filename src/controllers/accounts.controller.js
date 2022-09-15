const accounts = require('../repository/accounts');
const bankingTransactions = require('../repository/bankingTransactions');
const users = require('../repository/users');

getAccounts = async (req, res, next) => {
  const documents = await accounts.getAllAccounts();

  res.json(documents);
};

createAccount = async (req, res, next) => {
  const userTypeLogged = req.decodedToken.userType;
  const userIdLogged = req.decodedToken.userId;

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
  const document = await bankingTransactions.getAccount(id);

  res.json(document);
};

updateAccount = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const documents = await bankingTransactions.updateAccount(id, data);

  res.json(documents);
};

deleteAccount = async (req, res, next) => {
  const id = req.params.id;
  const result = await accounts.deleteAccount(id);

  res.json(result);
};

getAccountsByOwnerId = async (req, res, next) => {
  const id = req.params.id;
  const documents = await bankingTransactions.getAccountsByOwnerId(id);

  res.json(documents);
};

getAccountByCode = async (req, res, next) => {
  const code = req.params.code;
  const document = await accounts.getAccountByCode(code);

  res.json(document);
};

validateAccount = async (req, res, next) => {
  const code = req.params.code;
  const dpi = req.query.dpi;

  let result = {
    ok: false,
    message: '',
  };

  if (dpi) {
    const account = await accounts.getAccountByCode(code);

    if (account) {
      const user = await users.getUser(account.owner._id);

      if (user.dpi === dpi) {
        result.ok = true;
        result = { ...result, ownerName: account.owner.name, ownerDpi: user.dpi, accountName: account.name, accountId: account._id };
      } else {
        result.message = `DPI value does not match.`
      }
    }
  } else {
    result.message = 'invalid DPI.'
  }

  res.json(result);
};

module.exports = {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountsByOwnerId,
  getAccountByCode,
  validateAccount,
};
