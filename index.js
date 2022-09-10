const express = require('express');

// const express = require('express')
const bodyParser = require('body-parser');

const cool = require('cool-ascii-faces');
const first = require('./src/first');
const users = require('./src/users/users');

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const clientMongoDb = new MongoClient(uri);

clientMongoDb.connect(async (err) => {
  console.log(`MongoDB connected!!!`);
});

const path = require('path');
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cools', (req, res) => res.send(cool()))
  .get('/times', async (req, res) => {
    const result = await showTimes();
    res.send(result);
  })
  .get('/users/:id', async (req, res) => {
    const id = req.params.id;
    const result = await getUser(id);
    res.send(result);
  })
  .get('/users', async (req, res) => {
    const result = await getUsers();
    res.send(result);
  })
  .post('/users', async (req, res) => {
    const result = await createUser(req.body);
    res.send(result);
  })
  .patch('/users/:id', async (req, res) => {
    const id = req.params.id;
    const result = await updateUser(id, req.body);
    res.send(result);
  })
  .delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const result = await deleteUser(id);
    res.send(result);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

showTimes = async () => {
  const resultFirst = await first.run(clientMongoDb);

  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return { result, mongoUri, resultFirst };
};

getUser = async (id) => {
  const document = await users.getUser(clientMongoDb, id);

  return document;
};

getUsers = async () => {
  const documents = await users.getAllUsers(clientMongoDb);

  return documents;
};

createUser = async (data) => {
  const documents = await users.createUser(clientMongoDb, data);

  return documents;
};

updateUser = async (id, data) => {
  const documents = await users.updateUser(clientMongoDb, id, data);

  return documents;
};

deleteUser = async (id) => {
  const result = await users.deleteUser(clientMongoDb, id);

  return result;
};
