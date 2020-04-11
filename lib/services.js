const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const saltRounds = 10;
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
let users = [];

/* Authentication */
const validatePassword = password => {
  if (!password || !typeof password === 'string') throw { msg: 'Invalid password', status: 400 };
  if (password.length < 8) throw { msg: 'Password too short', status: 400 };
  if (password.length > 128) throw { msg: 'Password too long', status: 400 };
  return true;
};
const hashPassword = async (password, previousSalt) => {
  const salt = previousSalt || (await bcrypt.genSalt(saltRounds));
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
};
const checkPassword = async (username, password) => {
  let user = await getUser({ username });
  if (!user) throw { msg: `No such user found!`, status: 400 };
  const { hash } = await hashPassword(password, user.salt);
  if (hash !== user.hash) throw { msg: `Credentials invalid please try again.`, status: 401 };
  return true;
};

/* User */
const saveUser = async details => {
  const { salt, hash, username, password, email } = details;
  const user = { salt, hash, username, password, email };
  // TODO: save operation
  let resp = userModel.create(user);
  // let position = users.push({ username, email, hash, salt });
  return resp;
};
const getUser = async params => {
  let validKeys = ['username', 'email'];
  Object.keys(params).map(k => {
    if (!validKeys.includes(k)) {
      throw { msg: `Cannot search by key '${k}'`, status: 400 };
    }
  });
  let user = await userModel.findOne(params);
  return user;
};
const searchUser = async ({ searchKey }) => {
  if (!searchKey) throw { msg: `Search input cannot be empty !`, status: 400 };
  let query = {};
  if (emailRegexp.test(searchKey)) {
    query['email'] = searchKey;
  } else {
    query['username'] = searchKey;
  }
  console.log({ query });
  let user = await userModel.findOne(query, 'username email');
  console.log({ user });
  return user;
};
const getUserList = async params => {
  let validKeys = ['username', 'email'];
  Object.keys(params).map(k => {
    if (!validKeys.includes(k)) {
      throw { msg: `Cannot search by key '${k}'`, status: 400 };
    }
  });

  let users = await userModel.find(params, 'username email connections');
  return users;
};
const getConnections = async params => {
  let { loggedInUser } = params;
  let user = await userModel.findById(loggedInUser._id, 'connections').populate('connections', 'username email');
  if (!user) throw { msg: `Couln't find user. Please try again!` };
  return user.connections || [];
};
const addConnection = async params => {
  let {
    loggedInUser: { _id },
    connectionId,
  } = params;
  if (!ObjectId.isValid(_id) || !ObjectId.isValid(connectionId)) {
    throw { msg: `Invalid user ID`, status: 400 };
  }
  let resp = await userModel.updateOne(
    {
      _id: ObjectId(_id),
      connections: { $nin: ObjectId(connectionId) },
    },
    {
      $push: { connections: ObjectId(connectionId) },
    }
  );
  if(!resp.nModified) {
    throw { msg: `Couldn't add user to your connections. Are they already in your connections?`, status: 400}
  }
  return resp;
};
const removeConnection = async params => {
  let {
    loggedInUser: { _id },
    connectionId,
  } = params;
  if (!ObjectId.isValid(_id) || !ObjectId.isValid(connectionId)) {
    throw { msg: `Invalid user ID`, status: 400 };
  }
  let resp = await userModel.updateOne(
    {
      _id: ObjectId(_id),
      connections: { $in: ObjectId(connectionId) },
    },
    {
      $pull: { connections: ObjectId(connectionId) },
    }
  );
  if(!resp.nModified) {
    throw { msg: `Couldn't remove user to your connections. Are they in your connections?`, status: 400}
  }
  return resp;
};
module.exports = {
  validatePassword,
  checkPassword,
  hashPassword,
  saveUser,
  getUserList,
  getUser,
  searchUser,
  addConnection,
  getConnections,
  removeConnection
};
