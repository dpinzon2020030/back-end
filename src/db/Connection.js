const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

class Connection {
  static database;

  static async open() {
    if (this.dbX) return this.dbX;
    this.dbX = new MongoClient(uri);

    this.dbX.connect(async (err) => {
      // this.database = this.dbX.db(process.env.MONGODB_NAME);
      this.setDatabase();
      console.log(`MongoDB connected!!!`);
    });

    return this.dbX;
  }

  static async setDatabase() {
    this.database = this.dbX.db(process.env.MONGODB_NAME);
    console.log(`Set database!!!`);
  }
}

Connection.dbX = null;
Connection.database = null;

module.exports = { Connection };
