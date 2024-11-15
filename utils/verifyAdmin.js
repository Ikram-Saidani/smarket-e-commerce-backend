const { CustomFail } = require("./customResponses");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

async function verifyAdmin(req, res, next) {
  const token =
    req.headers.Authorization ||
    req.headers.authorization;

  jwt.verify(token, process.env.JWT, async function (err, decoded) {
    if (err) {
      res.json(new CustomFail("unauthorized user"));
      return;
    }
    const user = await UserModel.findById(decoded.id, { password: 0 });
    const isAdmin = user.role === "admin";
    if (!isAdmin) {
      res.json(new CustomFail("unauthorized user"));
      return;
    }

    req.user = decoded;

    next();
  });
}
module.exports = verifyAdmin;
