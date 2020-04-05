const checkUser = (req, res, next) => {
  console.log(req.session)
  if (req.session.user) {
    req.user = req.session.user;
    next();
  }
  res.status(401).send({ msg: `Please login to continue` });
};
module.exports = {
  checkUser
}
