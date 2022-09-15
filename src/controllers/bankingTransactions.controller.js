const bankingTransactions = require('../repository/bankingTransactions');

getTransactions = async (req, res, next) => {
  const id = req.params.id;
  const documents = await bankingTransactions.getAllTransactions(id);

  res.json(documents);
};

createTransaction = async (req, res, next) => {
  const data = req.body;
  const documents = await bankingTransactions.createTransaction(data);

  res.json(documents);
};

getTransaction = async (req, res, next) => {
  const id = req.params.id;
  const document = await bankingTransactions.getTransaction(id);

  res.json(document);
};

validateDebit = async (req, res, next) => {
  const id = req.params.id;
  const amount = req.query.amount;

  const document = await bankingTransactions.validateDebit(id, amount);

  const result = {
    ok: false,
  };

  if (document) {
    if (amount <= document.dailyDebitLimit - document.totalDebit) {
      result.ok = true;
    }
  }

  res.json(result);
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  validateDebit,
};
