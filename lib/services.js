const bcrypt = require('bcryptjs');
const saltRounds = 10;
let users = [];

const validatePassword = password => {
  if (!password || !typeof password === 'string') throw { msg: 'Invalid password', status: 400 };
  if (password.length < 8) throw { msg: 'Password too short', status: 400 };
  if (password.length > 128) throw { msg: 'Password too long', status: 400 };
  return true;
};
const hashPassword = async (password, previousSalt) => {
  const salt = previousSalt || (await bcrypt.genSalt(saltRounds));
  console.log({ password, salt });
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
};
const saveUser = async details => {
  const { salt, hash, username, password, email } = details;
  const user = { salt, hash, username, password, email };
  // TODO: save operation
  let position = users.push({ username, email, hash, salt });
  return await getUser(username);
};
const getUser = async username => {
  let user = users.find(u => u.username === username || u.email === username);
  if (!user) return null;
  user = Object.assign({}, user);
  delete user.hash;
  delete user.salt;
  return user;
};
const checkPassword = async (username, password) => {
  let user = users.find(u => u.username === username || u.email === username);
  if (!user) throw { msg: `No such user found!`, status: 400 };
  const { hash } = await hashPassword(password, user.salt);
  console.log(hash, user.hash);
  if (hash !== user.hash) throw { msg: `Credentials invalid please try again.`, status: 401 };
  return true;
};
module.exports = {
  validatePassword,
  checkPassword,
  hashPassword,
  saveUser,
  getUser,
};
