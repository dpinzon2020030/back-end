const ObjectId = require('mongodb').ObjectId;

const { Connection } = require('../db/Connection');
const users = require('./users');

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
    amount: 1,
  },
};
const optionsAccount = {
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

const getAllTransactions = async (accountId, startDate, endDate) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionName);

    const baseStartDate = new Date(startDate);
    const baseEndDate = new Date(endDate);

    baseEndDate.setHours(23);
    baseEndDate.setMinutes(59);
    baseEndDate.setSeconds(59);

    const query = { accountId: accountId, createdAt: { $gte: baseStartDate, $lt: baseEndDate } };

    const documents = await collection.find(query, options).toArray();

    return documents;
  } catch (err) {
    console.error(err);
  }
};

const createTransaction = async (data) => {
  try {
    let resultTransaction = { ok: true, message: '' };

    const accountId = data.accountId;
    const documentAccount = await getAccount(accountId);

    if (!documentAccount) {
      resultTransaction.ok = false;
      resultTransaction.message = `Account not exists. ${accountId}`;
      return resultTransaction;
    }

    const accountAvailableBalance = documentAccount.availableBalance;

    if (data.type === 'debit' && data.debit > accountAvailableBalance) {
      resultTransaction.ok = false;
      resultTransaction.message = `Monto insuficiente para hacer el debito. Monto disponible: ${accountAvailableBalance}`;
      return resultTransaction;
    }

    const documentDailyRunningTotal = await getDailyRunningTotal(accountId);

    if (data.type === 'debit' && data.debit > documentDailyRunningTotal.dailyDebitLimit - documentDailyRunningTotal.totalDebit) {
      resultTransaction.ok = false;
      resultTransaction.message = `Monto excede al limite diario. Monto diario disponible: ${
        documentDailyRunningTotal.dailyDebitLimit - documentDailyRunningTotal.totalDebit
      }`;
      return resultTransaction;
    }

    let accountTotalCredit = documentAccount.totalCredit;
    let accountTotalDebit = documentAccount.totalDebit;
    let accountCountCredits = documentAccount.countCredits;
    let accountCountDebits = documentAccount.countDebits;
    let accountCountTransactions = documentAccount.countTransactions;
    let dailyRunningTotalCredit = documentDailyRunningTotal.totalCredit;
    let dailyRunningTotalDebit = documentDailyRunningTotal.totalDebit;

    const database = Connection.database;
    const collection = database.collection(collectionName);

    const { credit, debit } = data;
    let amount = 0;
    accountTotalCredit += credit;
    accountTotalDebit += debit;
    dailyRunningTotalCredit += credit;
    dailyRunningTotalDebit += debit;

    if (!accountCountTransactions) {
      accountCountTransactions = 0;
    }
    if (!accountCountCredits) {
      accountCountCredits = 0;
    }
    if (!accountCountDebits) {
      accountCountDebits = 0;
    }
    accountCountTransactions++;
    if (data.type === 'credit') {
      amount = credit;
      accountCountCredits++;
    } else {
      amount = debit;
      accountCountDebits++;
    }

    const availableBalance = accountTotalCredit - accountTotalDebit;

    const newData = { ...data, createdAt: new Date(), balance: availableBalance, amount };

    const resultInsert = await collection.insertOne(newData);

    const baseTransaction = { ...newData, _id: resultInsert.insertedId };

    const dataAccount = {
      availableBalance,
      totalCredit: accountTotalCredit,
      totalDebit: accountTotalDebit,
      lastTransaction: baseTransaction,
      countTransactions: accountCountTransactions,
      ...(data.type === 'credit' ? { lastCreditTransaction: baseTransaction } : {}),
      ...(data.type === 'debit' ? { lastDebitTransaction: baseTransaction } : {}),
      ...(data.type === 'credit' ? { countCredits: accountCountCredits } : {}),
      ...(data.type === 'debit' ? { countDebits: accountCountDebits } : {}),
    };
    const dataDailyRunningTotal = { totalCredit: dailyRunningTotalCredit, totalDebit: dailyRunningTotalDebit };

    await updateAccount(accountId, dataAccount);
    await updateDailyRunningTotal(documentDailyRunningTotal._id, dataDailyRunningTotal);

    resultTransaction = { ...resultTransaction, ...baseTransaction };

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
  const data = { accountId, userId, description, credit: amount, debit: 0, date: new Date(), type: 'credit' };
  await createTransaction(data);
};

const getAccount = async (accountId) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameAccount);

    const query = { _id: ObjectId(accountId) };

    const document = await collection.findOne(query, optionsAccount);

    return { ...document, accountId };
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

const transfer = async (data) => {
  try {
    let result = { success: false, message: '' };
    const { originAccount, destinationAccount } = data;

    if (!data.userId) {
      result.message = 'userId invalid.';
      return result;
    }

    if (!data.amount) {
      result.message = 'Amount invalid.';
      return result;
    }

    if (!data.description) {
      result.message = 'Description invalid.';
      return result;
    }

    if (!originAccount) {
      result.message = 'Origin Account invalid.';
      return result;
    }

    if (!destinationAccount) {
      result.message = 'Destination Account invalid.';
      return result;
    }

    if (!originAccount._id) {
      result.message = 'Origin Account Id invalid.';
      return result;
    }

    if (!destinationAccount.code) {
      result.message = 'Destination Account Code invalid.';
      return result;
    }

    if (!destinationAccount.dpi) {
      result.message = 'Destination Account DPI invalid.';
      return result;
    }

    const accountId = originAccount._id;
    const amount = data.amount;
    const documentOriginAccount = await getAccount(accountId);

    if (!documentOriginAccount) {
      result.message = 'Origin Account not exists.';
      return result;
    }

    const documentDestinationAccount = await validateAccountByCodeAndDpi(destinationAccount.code, destinationAccount.dpi);

    if (!documentDestinationAccount.ok) {
      result.message = documentDestinationAccount.message;
      return result;
    }

    const accountAvailableBalance = documentOriginAccount.availableBalance;

    if (amount > accountAvailableBalance) {
      result.message = `Monto insuficiente para hacer el debito. Monto disponible: ${accountAvailableBalance}`;
      return result;
    }

    const documentDailyRunningTotal = await getDailyRunningTotal(accountId);

    if (amount > documentDailyRunningTotal.dailyDebitLimit - documentDailyRunningTotal.totalDebit) {
      result.message = `Monto excede al limite diario. Monto diario disponible: ${
        documentDailyRunningTotal.dailyDebitLimit - documentDailyRunningTotal.totalDebit
      }`;
      return result;
    }

    const dataDebit = {
      userId: data.userId,
      accountId: documentOriginAccount.accountId,
      date: new Date(),
      type: 'debit',
      credit: 0,
      debit: amount,
      description: `${data.description} - DEBIT`,
    };
    const documentDebit = await createTransaction(dataDebit);

    if (!documentDebit.ok) {
      result.message = documentDebit.message;
      return result;
    }

    const dataCredit = {
      userId: data.userId,
      accountId: documentDestinationAccount.accountId,
      date: new Date(),
      type: 'credit',
      credit: amount,
      debit: 0,
      description: `${data.description} - CREDIT`,
    };
    const documentCredit = await createTransaction(dataCredit);

    if (documentCredit.ok) {
      result.success = true;
      result = { ...result, originTransactionId: documentDebit._id, destinationTransactionId: documentCredit._id };
    }

    return result;
  } catch (err) {
    console.error(err);
  }
};

const getAccountByCode = async (code) => {
  try {
    const database = Connection.database;
    const collection = database.collection(collectionNameAccount);

    const query = { code: parseInt(code) };

    const document = await collection.findOne(query, optionsAccount);

    return document;
  } catch (err) {
    console.error(err);
  }
};

const validateAccountByCodeAndDpi = async (code, dpi) => {
  let result = {
    ok: false,
    message: '',
  };

  if (!dpi) {
    result.message = 'invalid DPI.';
    return result;
  }

  const account = await getAccountByCode(code);

  if (!account) {
    result.message = `Account not exists with this code: ${code}`;
    return result;
  }

  const user = await users.getUser(account.owner._id);

  if (!user) {
    result.message = `User not exists. ${account.owner._id}`;
    return result;
  }

  if (user.dpi !== dpi) {
    result.message = `DPI value does not match.`;
    return result;
  }

  result.ok = true;
  result = {
    ...result,
    ownerName: account.owner.name,
    ownerDpi: user.dpi,
    accountName: account.name,
    accountId: ObjectId(account._id).toString(),
  };

  return result;
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
  getAccountByCode,
  validateAccountByCodeAndDpi,
  transfer,
};
