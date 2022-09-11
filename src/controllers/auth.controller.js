const jwt = require('jsonwebtoken');

const users = require('../repository/users');

login = async (req, res, next) => {
  let { email, password } = req.body;

  let existingUser;
  let message;
  try {
    existingUser = await users.getUserByEmail(email);
  } catch {
    const error = new Error('Error! Something went wrong.');
    return next(error);
  }
  if (!existingUser || existingUser.password !== password) {
    message = 'Wrong details please check at once';
    const error = Error(message);

    res.status(404).json({
      success: false,
      message,
    });

    return next(error);
  }

  let token;

  try {
    //Creating jwt token
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email, userType: existingUser.userType }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  } catch (err) {
    console.error(err);

    message = 'Something went wrong.';

    const error = new Error(message);

    res.status(500).json({
      success: false,
      message,
    });

    return next(error);
  }

  res.status(200).json({
    success: true,
    data: {
      userId: existingUser._id,
      email: existingUser.email,
      token: token,
    },
  });
};

signup = async (req, res, next) => {
  const userTypeLogged = req.decodedToken.userType;

  if (userTypeLogged !== 'admin') {
    const message = 'User is not admin.';
    const error = new Error(message);

    res.status(401).json({
      success: false,
      message,
    });
    return next(error);
  }

  const { name, email, password, userType } = req.body;

  let newUser;
  const data = {
    name,
    email,
    password,
    userType,
  };

  try {
    newUser = await users.createUser(data);
  } catch {
    const message = 'Something went wrong.';
    const error = new Error(message);

    res.status(500).json({
      success: false,
      message,
    });
    return next(error);
  }

  let token;

  try {
    token = jwt.sign({ userId: newUser._id, email: newUser.email, userType: newUser.userType }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  } catch (err) {
    const message = 'Something went wrong.';
    const error = new Error(message);

    res.status(500).json({
      success: false,
      message,
    });

    return next(error);
  }

  res.status(201).json({
    success: true,
    data: { userId: newUser._id, email: newUser.email, token: token, _id: newUser._id },
  });
};

accessResource = async (req, res, next) => {
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
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    res
      .status(200)
      .json({ success: true, data: { userId: decodedToken.userId, email: decodedToken.email, userType: decodedToken.userType } });
  } catch (err) {
    console.error(err);

    const message = 'Error on decoding the token';
    const error = new Error(message);

    res.status(400).json({ success: false, message });

    return next(error);
  }
};

module.exports = {
  login,
  signup,
  accessResource,
};
