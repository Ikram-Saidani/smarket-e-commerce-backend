const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const bcrypt = require("bcryptjs");
const jwtGenerateToken = require("../utils/jwtGenerateToken");
const validationModel = require("../models/userValidation");
const main = require("../utils/nodemailer");
const { randomBytes } = require("crypto");

/**
 * @method post
 * @endpoint  ~/api/auth/register
 * @description register a new user
 * @accsess visitor
 *  */
async function registerController(req, res) {
  const existEmail = await catchDbErrors(
    UserModel.findOne({ email: req.body.email })
  );
  if (existEmail) {
    throw new CustomFail("Email is already in use");
  }
  let avatar;
  if (req.body.gender === "male") {
    avatar = `/men-avatar.png`;
  } else if (req.body.gender === "female") {
    avatar = `/woman-avatar.png`;
  } else {
    avatar = `/men-avatar.png`;
  }
  const newUser = new UserModel({
    ...req.body,
    avatar,
  });
  await catchDbErrors(newUser.save());
  const hash = randomBytes(16).toString("hex");
  main(newUser.email, hash).catch((e) => console.log("Email error:", e));
  await validationModel.create({ hash, userId: newUser._id });
  res.json(new CustomSuccess(newUser));
}

/**
 * @method post
 * @endpoint  ~/api/auth/login
 * @description login user
 * @accsess visitor
 *  */
async function loginController(req, res) {
  let existUser = await catchDbErrors(
    UserModel.findOne({ email: req.body.email })
  );

  if (!existUser) {
    throw new CustomFail("somthing went wrong ");
  }

  const isMatchPassword = bcrypt.compareSync(
    req.body.password,
    existUser.password
  );

  if (!isMatchPassword) {
    throw new CustomFail("somthing went wrong");
  }

  const token = jwtGenerateToken(existUser._id);
  const user = await UserModel.findById(existUser._id).select("-password");
  res.json(new CustomSuccess({ token: token, user: user }));
}

/**
 * @method post
 * @endpoint  ~/api/auth/loginadmin
 * @description login admin
 * @accsess visitor
 *  */
async function loginAdminController(req, res) {
  let existUser = await catchDbErrors(
    UserModel.findOne({ email: req.body.email })
  );
  if (!existUser) {
    throw new CustomFail("somthing went wrong");
  }

  const isMatchPassword = bcrypt.compareSync(
    req.body.password,
    existUser.password
  );

  if (!isMatchPassword) {
    throw new CustomFail("somthing went wrong");
  }

  if (!existUser.role === "admin") {
    throw new CustomFail("somthing went wrong");
  }

  const token = jwtGenerateToken(existUser._id);
  existUser.password = "";

  res.json(new CustomSuccess({ token: token, user: existUser }));
}

/**
 * @method post
 * @endpoint  ~/api/auth/checktoken
 * @description checktoken for user admin coordinator ambassador
 * @accsess user admin coordinator ambassador
 *  */
async function checkTokenController(req, res) {
  res.json(new CustomSuccess("token valid"));
}

/**
 * @method get
 * @endpoint  ~/api/auth/validateUser/:hash
 * @description validate user
 * @accsess visitor
 *  */
async function validateUserController(req, res) {
  const validate = await validationModel.findOne({ hash: req.params.hash });
  await UserModel.findByIdAndUpdate(validate.userId, { validUser: true });
  await validationModel.deleteOne({ hash: req.params.hash });
  res.json(new CustomSuccess("user validated"));
}

module.exports = {
  registerController,
  loginController,
  loginAdminController,
  checkTokenController,
  validateUserController,
};
