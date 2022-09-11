const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');
const bankingTransactions = require('./bankingTransactions');

const collectionName = 'accounts';
const options = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    name: 1,
    code: 1,
    dpi: 1,
    owner: 1,
    startingAmount: 1,
    availableBalance: 1,
    ownerId: 1,
    totalCredit: 1,
    totalDebit: 1,
    createdBy: 1,
  },
};

const getAllAccounts = async () => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = {};
    const documents = await collection.find(query, options).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

const createAccount = async (userId, data) => {
  try {
    const ownerId = data.owner._id;
    const code = await getAccountCode();

    const startingAmount = data.startingAmount;

    const newDocument = { ...data, ownerId, code, availableBalance: 0, totalCredit: 0, totalDebit: 0, createdBy: userId };

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const result = await collection.insertOne(newDocument);
    const accountId = ObjectId(result.insertedId).toString();

    await bankingTransactions.startingAmount(userId, accountId, startingAmount);

    return { ...newDocument, _id: result.insertedId };
  } catch (err) {
    console.error(err);
  }
};

const deleteAccount = async (id) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { _id: ObjectId(id) };
    let message = '';

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 1) {
      message = 'Successfully deleted one document.';
    } else {
      message = 'No documents matched the query. Deleted 0 documents.';
    }

    return { message, id };
  } catch (err) {
    console.error(err);
  }
};

const getAccountByCode = async (code) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { code: parseInt(code) };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const getAccountsByOwnerId = async (ownerId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { ownerId: ownerId };

    const document = await collection.find(query, options).toArray();

    return document;
  } catch (err) {
    console.error(err);
  }
};

const getAccountCode = async () => {
  try {
    const database = Connection.database;

    const collection = database.collection('sequentials');

    const query = { collectionName: 'accounts' };

    const document = await collection.findOne(query, { _id: 1, code: 1 });

    updateAccountCode(document._id, document.code);

    return document.code;
  } catch (err) {
    console.error(err);
  }
};

const updateAccountCode = async (id, code) => {
  try {
    const database = Connection.database;
    const collection = database.collection('sequentials');

    const query = { _id: ObjectId(id) };
    const options = { upsert: true };
    const newCode = code + 1;

    const updateDoc = {
      $set: {
        code: newCode,
      },
    };
    const result = await collection.updateOne(query, updateDoc, options);
    const message = `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`;

    return { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, document: { id, newCode }, message };
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getAllAccounts,
  createAccount,
  deleteAccount,
  getAccountByCode,
  getAccountsByOwnerId,
};
