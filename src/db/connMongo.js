const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

class DB {
  static database;
  static client;

  static async setUp() {
    if (!this.client) {
      await this.setClient();
      await this.setConnection();
    }

    return this.database;
  }

  static async setConnection() {
    this.database = this.client.db('depr-bank');
  }

  static async setClient() {
    console.log(`Connecting to database... ${uri}`);
    const client = new MongoClient(uri);

    client.connect(async (err) => {
      console.log(`MongoDB connected!!!`);

      this.client = client;
      console.log(`MongoDB exito!!!`);
      return;
    });
    // await client.connect();

    this.client = client;
  }
}

module.exports = DB;
