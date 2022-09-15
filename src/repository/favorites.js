const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');
const bankingTransactions = require('./bankingTransactions');

const collectionName = 'favorites';
const options = {
  sort: { name: 1 },
  projection: {
    _id: 1,
    userId: 1,
    accountCode: 1,
    accountDpi: 1,
    accountAlias: 1,
    createdBy: 1,
  },
};

const getAllFavorites = async () => {
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

const createFavorite = async (userId, data) => {
  try {
    let result = { ok: false, message: '' };

    if (!data.accountAlias) {
      result.message = 'Alias invalid.';
      return result;
    }

    if (!data.accountCode) {
      result.message = 'Account Code invalid.';
      return result;
    }

    if (!data.accountDpi) {
      result.message = 'Account DPI invalid.';
      return result;
    }

    const documentFavoriteAccount = await bankingTransactions.validateAccountByCodeAndDpi(data.accountCode, data.accountDpi);

    if (!documentFavoriteAccount.ok) {
      result.message = documentFavoriteAccount.message;
      return result;
    }

    const fav = await getFavoriteByUserAndCode(userId, data.accountCode);

    if (fav) {
      result.message = 'Favorite already exists.';
      return result;
    }

    const newDocument = { ...data, accountCode: parseInt(data.accountCode), userId, createdBy: userId, createdAt: new Date() };

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const resultNewDocument = await collection.insertOne(newDocument);

    result.ok = true;
    result = { ...result, ...newDocument, _id: resultNewDocument.insertedId };
    return result;
  } catch (err) {
    console.error(err);
  }
};

const getFavorite = async (favoriteId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { _id: ObjectId(favoriteId) };

    const document = await collection.findOne(query, options);

    return { ...document, favoriteId };
  } catch (err) {
    console.error(err);
  }
};

const updateFavorite = async (id, data) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

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

const deleteFavorite = async (id) => {
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

const getFavoriteByUserAndCode = async (userId, accountCode) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { userId, accountCode: parseInt(accountCode) };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const getFavoritesByOwnerId = async (ownerId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { userId: ownerId };

    const documents = await collection.find(query, options).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getAllFavorites,
  createFavorite,
  getFavorite,
  updateFavorite,
  deleteFavorite,
  getFavoriteByUserAndCode,
  getFavoritesByOwnerId,
};
