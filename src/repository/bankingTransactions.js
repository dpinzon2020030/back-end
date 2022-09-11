const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');

const collectionName = 'bankingTransactions';
const options = {
  sort: { name: 1 },
  projection: { _id: 1, description: 1, accountId: 1, userId: 1, ownerId: 1, date: 1, type: 1, credit: 1, debit: 1, createdAt: 1 },
};

const getAllTransactions = async (id) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { accountId: id };
    const documents = await collection.find(query, options).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

const createTransaction = async (data) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const newData = { ...data, createdAt: new Date() };
    console.log(`createTransaction newData`,newData)

    const result = await collection.insertOne(newData);

    return { ...newData, _id: result.insertedId };
  } catch (err) {
    console.error(err);
  }
};

const getTransaction = async (id) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { _id: ObjectId(id) };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const startingAmount = async (userId, accountId, amount) => {
  const description = 'APERTURA DE CUENTA';
  const data = { accountId, userId, description, credit: amount, debit: 0, date: new Date() };
  await createTransaction(data);
};

module.exports = { getTransaction, getAllTransactions, createTransaction, startingAmount };
