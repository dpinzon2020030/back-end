const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { Connection } = require('./src/db/Connection');
const cool = require('cool-ascii-faces');
const first = require('./src/first');
const authValidateAccessResource = require('./src/middlewares/auth.middleware');
const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const accountsRoutes = require('./src/routes/accounts.routes');
const bankingTransactionsRoutes = require('./src/routes/bankingTransactions.routes');

const path = require('path');
const PORT = process.env.PORT || 5000;

// This should go in the app/server setup, and waited for.
Connection.open().then(() => {
  express()
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/cools', (req, res) => res.send(cool()))
    .get('/times', async (req, res) => {
      const result = await showTimes();
      res.send(result);
    })
    .use('/api', authRoutes)
    .use('/api', authValidateAccessResource, usersRoutes)
    .use('/api', authValidateAccessResource, accountsRoutes)
    .use('/api', authValidateAccessResource, bankingTransactionsRoutes)
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
});

showTimes = async () => {
  const resultFirst = await first.run(clientMongoDb);

  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return { result, resultFirst };
};
