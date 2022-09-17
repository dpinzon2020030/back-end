const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');

const { Connection } = require('../db/Connection');
const symbols = require('../assets/symbols.json');

const collectionName = 'exchangeRates';
const options = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    base: 1,
    date: 1,
    rates: 1,
  },
};

const getSymbols = async () => {
  try {
    return symbols;
  } catch (err) {
    console.error(err);
  }
};

const getLatest = async () => {
  try {
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`;

    const documentLatest = await getLatestByDate(dateStr);

    if (documentLatest) {
      return documentLatest;
    }

    const documents = await getApilayerLatest();

    const result = await createLatest(documents);

    return result;
  } catch (err) {
    console.error(err);
  }
};

const getLatestByDate = async (date) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { date: date };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const createLatest = async (data) => {
  try {
    let result = { success: false, message: '' };

    const newDocument = {
      ...data,
      createdAt: new Date(),
    };

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const resultInsert = await collection.insertOne(newDocument);

    result.success = true;
    result = { ...result, ...newDocument, _id: resultInsert.insertedId };

    return result;
  } catch (err) {
    console.error(err);
  }
};

const getApilayerLatest = async () => {
  const config = {
    headers: {
      apikey: process.env.APILAYER_API_KEY,
    },
  };

  const res = await axios.get(`${process.env.APILAYER_URL}/latest?base=GTQ`, config);

  const data = res.data;

  return data;
};

const addZero = (value) => {
  const valueInt = parseInt(value);

  return valueInt < 10 ? `0${valueInt.toString()}` : valueInt.toString();
};

module.exports = {
  getSymbols,
  getLatest,
};
