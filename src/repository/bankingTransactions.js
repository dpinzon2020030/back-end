const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');

const collectionName = 'bankingTransactions';
const collectionNameAccount = 'accounts';
const options = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    description: 1,
    accountId: 1,
    userId: 1,
    ownerId: 1,
    date: 1,
    type: 1,
    credit: 1,
    debit: 1,
    createdAt: 1,
    balance: 1,
  },
};
const optionsAccount = {
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
    const accountId = data.accountId;
    const account = await getAccount(accountId);
    let { totalCredit, totalDebit } = account;

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const { credit, debit } = data;
    totalCredit += credit;
    totalDebit += debit;
    const availableBalance = totalCredit - totalDebit;

    const newData = { ...data, createdAt: new Date(), balance: availableBalance };

    const result = await collection.insertOne(newData);

    const dataAccount = { availableBalance, totalCredit, totalDebit };

    await updateAccount(accountId, dataAccount);

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

const getAccount = async (id) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameAccount);

    const query = { _id: ObjectId(id) };

    const document = await collection.findOne(query, optionsAccount);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const updateAccount = async (id, data) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameAccount);

    const query = { _id: ObjectId(id) };
    const optionsUpdate = { upsert: true };

    const updateDoc = {
      $set: {
        ...data,
      },
    };
    const result = await collection.updateOne(query, updateDoc, optionsUpdate);
    const message = `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`;

    return { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, document: { id, data }, message };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getTransaction, getAllTransactions, createTransaction, startingAmount, getAccount, updateAccount };
