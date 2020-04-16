const express = require('express');
const router = express.Router();
const services = require('../lib/services');
const middlewares = require('../middlewares');
// router.use(express.static('public'))
router.get('/me', middlewares.checkUser, (req, res) => res.send({ user: req.user }));
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        msg: `Please enter username and password!`,
      });
    }

    await services.checkPassword(username, password);
    let user = await services.getUser({username});
    req.session.user = user;
    req.session.save((err, data) => {
      res.send({
        msg: `Successfully logged in!`,
      });
    });
  } catch (error) {
    console.log({ error });
    res.status(error.status || 400).json(error);
  }
});
router.post('/logout', async (req, res) => {
  try {
    req.session.destroy();
    res.json({msg: 'You have logged out!'})
  } catch (error) {
    console.log({ error });
    res.status(error.status || 400).json(error);
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password || !email)
      return res.status(400).json({
        msg: 'Email, password and username are required!',
      });
    if ((await services.getUser({username})) || (await services.getUser({email}))) {
      return res.status(400).json({
        msg: 'User already exists!',
      });
    }
    services.validatePassword(password);
    let { hash, salt } = await services.hashPassword(password);
    let user = await services.saveUser({ salt, hash, username, email, password });
    res.send({ data: user, msg: 'successfully registered!' });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});
router.get('/user', async (req, res) => {
  try {
    let users = await services.getUserList(req.query);
    res.send(users);
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});
router.get('/connection', middlewares.checkUser, async (req, res) => {
  try {
    let { user: loggedInUser} = req;
    let resp = await services.getConnections({loggedInUser});
    res.send(resp)
  } catch (error) {
    console.log({error})
    res.status(error.status || 500).send(error);
  }
})
router.get('/user/search', async (req, res) => {
  try {
    let users = await services.searchUser(req.query);
    res.send(users);
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});
router.put('/user/addConnection', middlewares.checkUser, async (req, res) => {
  try {
    let { user: loggedInUser} = req;
    let resp = await services.addConnection({...req.body, loggedInUser});
    res.send({ msg: `Your are now connected!`})
  } catch (error) {
    console.log({error})
    res.status(error.status || 500).send(error);
  }
})
router.put('/user/removeConnection', middlewares.checkUser, async (req, res) => {
  try {
    let { user: loggedInUser} = req;
    let resp = await services.removeConnection({...req.body, loggedInUser});
    res.send({ msg: `Your are now disconnected!`})
  } catch (error) {
    console.log({error})
    res.status(error.status || 500).send(error);
  }
})
module.exports = router;
