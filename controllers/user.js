const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const fs = require("fs");
const path = require("path");

/**
 * @method put
 * @endpoint ~/api/user/update/:id
 * @description update user profile (without image)
 * @access user
 */
async function userUpdateProfileController(req, res) {
  const isAutorizedUser = req.user._id.toString() === req.params.id;
  if (!isAutorizedUser) {
    throw new CustomFail("unauthorized access");
  }
  let updatedUser;
  if (!req.body.address) {
    updatedUser = await catchDbErrors(
      UserModel.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
      })
    );
  } else {
    updatedUser = await catchDbErrors(
      UserModel.findByIdAndUpdate(req.user._id, {
        $push: { address: req.body.address },
      })
    );
    delete req.body.address;
    updatedUser = await catchDbErrors(
      UserModel.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
      })
    );
  }

  res.json(new CustomSuccess(updatedUser));
}

/**
 * @method put
 * @endpoint ~/api/user/updateimage/:id
 * @description update user's image
 * @access user
 */
async function updateUserImage(req, res) {
  const file = req.file;
  const isAutorizedUser = req.user._id.toString() === req.params.id;
  const userId = req.params.id;
  if (!isAutorizedUser) {
    throw new CustomFail("unauthorized");
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomFail("User not found");
  }
  if (user.avatar && user.avatar !== "/images.png") {
    const oldAvatarPath = path.join(__dirname, "../", user.avatar);
    fs.unlink(oldAvatarPath, (err) => {
      if (err) console.error("Failed to delete old avatar:", err);
    });
  }
  const updatedUser = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      userId,
      { avatar: `/uploads/avatars/${userId}/${file.filename}` },
      { new: true }
    )
  );

  res.json(new CustomSuccess(updatedUser));
}

/**
 * @method put
 * @endpoint ~/api/user/coinsearned/:id
 * @description update coins earned by user
 * @access user
 */
async function updateCoinsEarned(req, res) {
  const isAutorizedUser = req.user._id.toString() === req.params.id;
  if (!isAutorizedUser) {
    throw new CustomFail("unauthorized");
  }
  const updatedUser = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { coinsEarned: req.body.coinsEarned } },
      { new: true }
    )
  );
  res.json(new CustomSuccess(updatedUser));
}

/**
 * @method put
 * @endpoint ~/api/user/role/:id
 * @description update user's role by admin
 * @access admin
 */
async function updateUserRole(req, res) {
  const updatedUser = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    )
  );
  res.json(new CustomSuccess(updatedUser));
}

/**
 * @method get
 * @endpoint  ~/api/user
 * @description get all users
 * @access admin
 */
async function getAllUsers(req, res) {
  const users = await catchDbErrors(UserModel.find());
  if (!users || users.length === 0) {
    throw new CustomFail("No users found");
  }
  res.json(new CustomSuccess(users));
}

/**
 * @method get
 * @route  ~/api/user/firstorder
 * @desc   Get users that have not made any orders
 * @access Admin
 */
async function getUsersWithNoOrder(req, res) {
  const users = await catchDbErrors(UserModel.find());
  if (!users || users.length === 0) {
    throw new CustomFail("No users found");
  }

  const usersWithNoOrders = [];
  for (const user of users) {
    const orders = await catchDbErrors(OrderModel.find({ userId: user._id }));
    if (!orders || orders.length === 0) {
      usersWithNoOrders.push(user);
    }
  }

  if (usersWithNoOrders.length === 0) {
    throw new CustomFail("All users have made at least one order");
  }

  res.json(new CustomSuccess(usersWithNoOrders));
}

/**
 * @method get
 * @endpoint  ~/api/user/coordinators
 * @description get coordinators
 * @access admin
 */
async function getCoordinators(req, res) {
  const coordinators = await catchDbErrors(
    UserModel.find({ role: "coordinator" })
  );
  if (!coordinators || coordinators.length === 0) {
    throw new CustomFail("No coordinators found");
  }
  res.json(new CustomSuccess(coordinators));
}

/**
 * @method get
 * @endpoint  ~/api/user/ambassadors
 * @description get ambassadors
 * @access admin
 */
async function getAmbassadors(req, res) {
  const ambassadors = await catchDbErrors(
    UserModel.find({ role: "ambassador" })
  );
  if (!ambassadors || ambassadors.length === 0) {
    throw new CustomFail("No ambassadors found");
  }
  res.json(new CustomSuccess(ambassadors));
}

/**
 * @method get
 * @endpoint  ~/api/user/users
 * @description get users
 * @access admin
 */
async function getUsers(req, res) {
  const users = await catchDbErrors(UserModel.find({ role: "user" }));
  if (!users || users.length === 0) {
    throw new CustomFail("No users found");
  }
  res.json(new CustomSuccess(users));
}

/**
 * @method delete
 * @endpoint  ~/api/user/delete/:id
 * @description delete user
 * @access admin
 */
async function deleteUser(req, res) {
  const user = await catchDbErrors(UserModel.findByIdAndDelete(req.params.id));
  if (!user) {
    throw new CustomFail("User not found");
  }
  res.json(new CustomSuccess("User deleted"));
}

/**
 * @method get
 * @endpoint  ~/api/user/birthday
 * @description get users that their birthday is in this month
 * @access admin
 */
async function getUsersWithBirthday(req, res) {
  const users = await catchDbErrors(UserModel.find());
  if (!users || users.length === 0) {
    throw new CustomFail("No users found");
  }

  const usersWithBirthday = [];
  const today = new Date();
  for (const user of users) {
    const userBirthday = new Date(user.dateOfBirth);
    if (
      userBirthday.getMonth() === today.getMonth()
    ) {
      usersWithBirthday.push(user);
    }
  }

  if (usersWithBirthday.length === 0) {
    throw new CustomFail("No users have birthday today");
  }

  res.json(new CustomSuccess(usersWithBirthday));
}

module.exports = {
  userUpdateProfileController,
  updateUserImage,
  updateCoinsEarned,
  updateUserRole,
  getAllUsers,
  getUsersWithNoOrder,
  getCoordinators,
  getAmbassadors,
  getUsers,
  deleteUser,
  getUsersWithBirthday,
};
