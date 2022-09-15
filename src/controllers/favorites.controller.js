const favorites = require('../repository/favorites');

getFavorites = async (req, res, next) => {
  const documents = await favorites.getAllFavorites();

  res.json(documents);
};

createFavorite = async (req, res, next) => {
  const userIdLogged = req.decodedToken.userId;

  const data = req.body;
  const result = await favorites.createFavorite(userIdLogged, data);

  res.json(result);
};

getFavorite = async (req, res, next) => {
  const id = req.params.id;
  const document = await favorites.getFavorite(id);

  res.json(document);
};

updateFavorite = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const documents = await favorites.updateFavorite(id, data);

  res.json(documents);
};

deleteFavorite = async (req, res, next) => {
  const id = req.params.id;
  const result = await favorites.deleteFavorite(id);

  res.json(result);
};

getFavoritesByOwnerId = async (req, res, next) => {
  const id = req.params.id;
  const documents = await favorites.getFavoritesByOwnerId(id);

  res.json(documents);
};

module.exports = {
  getFavorites,
  createFavorite,
  getFavorite,
  updateFavorite,
  deleteFavorite,
  getFavoritesByOwnerId,
};
