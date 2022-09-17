const bankingTransactions = require('../repository/bankingTransactions');

getTransactions = async (req, res, next) => {
  const accountId = req.params.id;
  const startDate = req.query['start-date'];
  const endDate = req.query['end-date'];

  const documents = await bankingTransactions.getAllTransactions(accountId, startDate, endDate);

  res.json(documents);
};

createTransaction = async (req, res, next) => {
  const data = req.body;
  const document = await bankingTransactions.createTransaction(data);

  res.json(document);
};

getTransaction = async (req, res, next) => {
  const id = req.params.id;
  const document = await bankingTransactions.getTransaction(id);

  res.json(document);
};

validateDebit = async (req, res, next) => {
  const id = req.params.id;
  const amount = req.query.amount;

  const result = await bankingTransactions.validateDebit(id, amount);

  res.json(result);
};

transfer = async (req, res, next) => {
  const data = req.body;
  const result = await bankingTransactions.transfer(data);

  res.json(result);
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  validateDebit,
  transfer,
};
