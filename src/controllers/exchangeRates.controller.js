const exchangeRates = require('../repository/exchangeRates');

getSymbols = async (req, res, next) => {
  const documents = await exchangeRates.getSymbols();

  res.json(documents);
};

getLatest = async (req, res, next) => {
  const documents = await exchangeRates.getLatest();

  res.json(documents);
};

module.exports = {
  getSymbols,
  getLatest,
};
