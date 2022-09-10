const ObjectId = require('mongodb').ObjectId;

const collectionName = 'users';
const options = {
  // sort returned documents in ascending order by title (A->Z)
  sort: { name: 1 },
  // Include only the `title` and `imdb` fields in each returned document
  projection: { _id: 1, name: 1, phone: 1 },
};

const getUser = async (clientMongoDb, id) => {
  try {
    const database = clientMongoDb.db(process.env.MONGODB_NAME);
    const collection = database.collection(collectionName);

    const query = { _id: ObjectId(id) };

    const document = await collection.findOne(query, options);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const getAllUsers = async (clientMongoDb) => {
  try {
    const database = clientMongoDb.db(process.env.MONGODB_NAME);
    const collection = database.collection(collectionName);

    const query = {};

    const documents = await collection.find(query, options).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

const createUser = async (clientMongoDb, data) => {
  try {
    console.log(data);
    const database = clientMongoDb.db(process.env.MONGODB_NAME);
    const collection = database.collection(collectionName);

    const result = await collection.insertOne(data);

    return { ...data, _id: result.insertedId };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getUser, getAllUsers, createUser };
