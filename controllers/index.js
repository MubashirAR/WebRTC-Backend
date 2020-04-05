const express = require('express');
const router = express.Router();
const services = require('../lib/services');
const middlewares = require('../middlewares');
router.get('/', middlewares.checkUser, (req, res) => res.send({ msg: 'Welcome to the api', user: req.session.user }));
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        msg: `Please enter username and password!`,
      });
    }

    await services.checkPassword(username, password);
    let user = await services.getUser(username);
    console.log(req.session)
    req.session.user = user;
    res.json({
      msg: `Successfully logged in!`,
    });
  } catch (error) {
    console.log({error})
    res.status(error.status || 400).json(error);
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log({ username, email, password });
    if (!username || !password || !email)
      return res.status(400).json({
        msg: 'Email, password and username are required!',
      });
    if ((await services.getUser(username)) || (await services.getUser(email))) {
      return res.status(400).json({
        msg: 'User already exists!',
      });
    }
    services.validatePassword(password);
    let { hash, salt } = await services.hashPassword(password);
    let user = await services.saveUser({ salt, hash, username, email, password });
    res.send({ data: user });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});
module.exports = router;
