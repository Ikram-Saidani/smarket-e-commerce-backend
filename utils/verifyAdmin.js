const { CustomFail } = require("./customResponses");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const catchDbErrors = require("./catchDbErros");

async function verifyAdmin(req, res, next) {
  let token = req.headers.Authorization || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }
  jwt.verify(token, process.env.JWT, async (err, decoded)=> {
    if (err) {
      res.json(new CustomFail("unauthorized user"));
      return;
    }
    const user = await catchDbErrors(
      UserModel.findById(decoded.id, { password: 0 })
    );
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
