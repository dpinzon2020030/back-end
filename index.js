const express = require('express');
const cool = require('cool-ascii-faces');
const first = require('./src/first');

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
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cools', (req, res) => res.send(cool()))
  .get('/times', async (req, res) => {
    const result = await showTimes();
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
