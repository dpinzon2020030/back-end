const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');

const collectionName = 'bankingTransactions';
const collectionNameAccount = 'accounts';
const collectionNameDailyRunningTotal = 'dailyRunningTotal';

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
const optionsDailyRunningTotal = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    accountId: 1,
    dateTransaction: 1,
    totalCredit: 1,
    totalDebit: 1,
    dailyDebitLimit: 1,
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
    const documentAccount = await getAccount(accountId);

    let resultTransaction = { ok: true, message: '' };
    const accountAvailableBalance  = documentAccount.availableBalance;

    if (data.type === 'debit' && data.debit > accountAvailableBalance) {
      resultTransaction.ok = false;
      resultTransaction.message = `Monto insuficiente para hacer el debito. Monto disponible: ${accountAvailableBalance}`;
      return resultTransaction;
    }

    const documentDailyRunningTotal = await getDailyRunningTotal(accountId);

    let accountTotalCredit = documentAccount.totalCredit;
    let accountTotalDebit = documentAccount.totalDebit;
    let dailyRunningTotalCredit = documentDailyRunningTotal.totalCredit;
    let dailyRunningTotalDebit = documentDailyRunningTotal.totalDebit;

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const { credit, debit } = data;
    accountTotalCredit += credit;
    accountTotalDebit += debit;
    dailyRunningTotalCredit += credit;
    dailyRunningTotalDebit += debit;

    const availableBalance = accountTotalCredit - accountTotalDebit;

    const newData = { ...data, createdAt: new Date(), balance: availableBalance };

    const result = await collection.insertOne(newData);

    const dataAccount = { availableBalance, totalCredit: accountTotalCredit, totalDebit: accountTotalDebit };
    const dataDailyRunningTotal = { totalCredit: dailyRunningTotalCredit, totalDebit: dailyRunningTotalDebit };

    await updateAccount(accountId, dataAccount);
    await updateDailyRunningTotal(documentDailyRunningTotal._id, dataDailyRunningTotal);

    resultTransaction = { ...resultTransaction, ...newData, _id: result.insertedId };

    return resultTransaction;
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

const getAccountsByOwnerId = async (ownerId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameAccount);

    const query = { 'owner._id': ownerId };

    const documents = await collection.find(query, optionsAccount).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

const createDailyRunningTotal = async (accountId, dateTransaction) => {
  try {
    const newDocument = {
      accountId,
      dateTransaction,
      totalCredit: 0,
      totalDebit: 0,
      dailyDebitLimit: process.env.DAILY_DEBIT_LIMIT,
      createdAt: new Date(),
    };

    const database = Connection.database;
    const collection = database.collection(collectionNameDailyRunningTotal);

    const result = await collection.insertOne(newDocument);

    return { ...newDocument, _id: result.insertedId };
  } catch (err) {
    console.error(err);
  }
};

const getDailyRunningTotal = async (accountId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameDailyRunningTotal);
    const date = new Date();

    const dateTransaction = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const query = { accountId, dateTransaction };

    let document = await collection.findOne(query, optionsDailyRunningTotal);

    if (!document) {
      document = await createDailyRunningTotal(accountId, dateTransaction);
    }

    return document;
  } catch (err) {
    console.error(err);
  }
};

const updateDailyRunningTotal = async (id, data) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameDailyRunningTotal);

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

const validateDebit = async (accountId, amount) => {
  try {
    let documentDailyRunningTotal = await getDailyRunningTotal(accountId);

    const result = {
      ok: false,
    };

    if (documentDailyRunningTotal) {
      if (amount <= documentDailyRunningTotal.dailyDebitLimit - documentDailyRunningTotal.totalDebit) {
        result.ok = true;
      }
    }

    return result;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getTransaction,
  getAllTransactions,
  createTransaction,
  startingAmount,
  getAccount,
  updateAccount,
  getAccountsByOwnerId,
  validateDebit,
};
