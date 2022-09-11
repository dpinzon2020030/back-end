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


module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
};
