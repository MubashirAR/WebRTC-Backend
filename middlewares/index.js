const checkUser = (req, res, next) => {
  console.log(req.session, req.user, req.cookies)
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).send({ msg: `Please login to continue` });
};
module.exports = {
  checkUser
}
