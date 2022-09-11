const jwt = require('jsonwebtoken');

validateAccessResource = async (req, res, next) => {
  if (!req.headers.authorization) {
    const message = 'Authorization was not provided.';
    const error = new Error(message);

    res.status(400).json({ success: false, message });

    return next(error);
  }

  const token = req.headers.authorization.split(' ')[1];
  //Authorization: 'Bearer TOKEN'

  if (!token) {
    const message = 'Token was not provided.';
    const error = new Error(message);

    res.status(400).json({ success: false, message });

    return next(error);
  }

  //Decoding the token
  try {
    const decodedToken = jwt.verify(token, 'secretkeyappearshere');

    // return res.redirect('/login');

    // res.status(200).json({ success: true, data: { userId: decodedToken.userId, email: decodedToken.email } });
    next();
  } catch (err) {
    console.error(err);

    const message = 'Error on decoding the token';
    const error = new Error(message);

    res.status(400).json({ success: false, message });
    // return res.redirect('/login');
    // res.redirect('/login');

    return next(error);
  }
};

module.exports = validateAccessResource;
