const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');
const bankingTransactions = require('./bankingTransactions');
const users = require('./users');

const collectionName = 'accounts';
const options = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    name: 1,
    code: 1,
    owner: 1,
    startingAmount: 1,
    availableBalance: 1,
    ownerId: 1,
    totalCredit: 1,
    totalDebit: 1,
    createdBy: 1,
    lastTransaction: 1,
    lastCreditTransaction: 1,
    lastDebitTransaction: 1,
    countCredits: 1,
    countDebits: 1,
    countTransactions: 1,
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
    let result = { success: false, message: '' };
    const { startingAmount } = data;

    if (!startingAmount || startingAmount < process.env.MINIMUM_OPENING_AMOUNT) {
      result.message = `Monto de Apertura Invalido. El Minimo de Monto de Apertura valido es: ${process.env.MINIMUM_OPENING_AMOUNT}`;
      return result;
    }

    const ownerId = data.ownerId;
    const documentUser = await users.getUser(ownerId);

    if (!documentUser) {
      result.message = `Id. de Usuario invalido. ${ownerId}`;
      return result;
    }

    const code = await generateAccountCode();

    const newDocument = {
      ...data,
      owner: {
        _id: ownerId,
        name: documentUser.name,
      },
      ownerId,
      code,
      availableBalance: 0,
      totalCredit: 0,
      totalDebit: 0,
      countCredits: 0,
      countDebits: 0,
      countTransactions: 0,
      createdBy: userId,
    };

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const resultInsert = await collection.insertOne(newDocument);
    const accountId = ObjectId(resultInsert.insertedId).toString();

    await bankingTransactions.startingAmount(userId, accountId, startingAmount);

    result.success = true;
    result = { ...result, ...newDocument, _id: resultInsert.insertedId };
    return result;
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
    let success = false;

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 1) {
      success = true;
      message = 'Successfully deleted one document.';
    } else {
      message = 'No documents matched the query. Deleted 0 documents.';
    }

    return { success, message, id };
  } catch (err) {
    console.error(err);
  }
};

const generateAccountCode = async () => {
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
};
