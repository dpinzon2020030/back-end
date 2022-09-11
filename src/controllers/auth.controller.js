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
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'secretkeyappearshere', { expiresIn: '1h' });
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
      userId: existingUser.id,
      email: existingUser.email,
      token: token,
    },
  });
};

signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let newUser;
  const data = {
    name,
    email,
    password,
  };

  try {
    newUser = await users.createUser(data);

    // await newUser.save();
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
    token = jwt.sign({ userId: newUser._id, email: newUser.email }, 'secretkeyappearshere', { expiresIn: '1h' });
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
    data: { userId: newUser.id, email: newUser.email, token: token },
  });
};

module.exports = {
  login,
  signup,
};
