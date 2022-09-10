const run = async (clientMongoDb) => {
  try {
    const database = clientMongoDb.db('sample_mflix');
    const movies = database.collection('movies');

    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);

    console.log(movie);

    return movie;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { run };
