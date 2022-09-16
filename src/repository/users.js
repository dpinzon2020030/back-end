const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');

const collectionName = 'users';
const options = {
  sort: { name: 1 },
  projection: { _id: 1, name: 1, nickname: 1, dpi: 1, address: 1, phone: 1, email: 1, job: 1, monthlyIncome: 1, password: 1, userType: 1 },
};

const getAllUsers = async () => {
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

const createUser = async (data) => {
  try {
    let result = { success: false, message: '' };

    const email = data.email;
    const documentUser = await getUserByEmail(email);

    if (documentUser) {
      result.message = `Email already exists. userId: ${documentUser._id} email: ${email}`;
      return result;
    }

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const resultInsert = await collection.insertOne(data);

    result.success = true;
    result = { ...result, ...data, _id: resultInsert.insertedId };

    return result;
  } catch (err) {
    console.error(err);
  }
};

const getUser = async (id) => {
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

const updateUser = async (id, data) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { _id: ObjectId(id) };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        ...data,
      },
    };
    const result = await collection.updateOne(query, updateDoc, options);
    const message = `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`;

    return { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, document: { id, data }, message };
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (id) => {
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

const getUserByEmail = async (email) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const query = { email: email };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getUser, getAllUsers, createUser, updateUser, deleteUser, getUserByEmail };
