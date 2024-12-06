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
  //don't update the password
  let updatedUser;
  delete req.body.password;
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
    updatedUser = await catchDbErrors(
      UserModel.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
      }).select("-password")
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
async function updateUserImageController(req, res) {
  const file = req.file;
  const userId = req.params.id;
  const isAuthorizedUser = req.user._id == userId;
  if (!isAuthorizedUser) {
    throw new CustomFail("Unauthorized");
  }
  const user = await catchDbErrors(UserModel.findById(userId));
  if (!user) {
    throw new CustomFail("User not found");
  }
  if (user.avatar) {
    const oldAvatarPath = path.join(__dirname, "../", user.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlink(oldAvatarPath, (err) => {
        if (err) console.error("Failed to delete old avatar:", err);
      });
    }
  }

  const updatedUser = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      userId,
      { avatar: `/avatars/${userId}/${file.filename}` },
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
async function updateCoinsEarnedController(req, res) {
  const isAutorizedUser = req.user._id == req.params.id;
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
async function updateUserRoleController(req, res) {
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
async function getAllUsersController(req, res) {
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
async function getUsersWithNoOrderController(req, res) {
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
async function getCoordinatorsController(req, res) {
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
async function getAmbassadorsController(req, res) {
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
async function getUsersController(req, res) {
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
async function deleteUserController(req, res) {
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
async function getUsersWithBirthdayController(req, res) {
  const users = await catchDbErrors(UserModel.find());
  if (!users || users.length === 0) {
    throw new CustomFail("No users found");
  }

  const usersWithBirthday = [];
  const today = new Date();
  for (const user of users) {
    const userBirthday = new Date(user.dateOfBirth);
    if (userBirthday.getMonth() === today.getMonth()) {
      usersWithBirthday.push(user);
    }
  }

  if (usersWithBirthday.length === 0) {
    throw new CustomFail("No users have birthday today");
  }

  res.json(new CustomSuccess(usersWithBirthday));
}

/**
 * @method get
 * @route : ~/api/user/unassignedcoordinators
 * @desc  : get coordinators that are not assigned to any group
 * @access : admin
 */
async function getUnassignedCoordinatorsController(req, res) {
  const coordinators = await catchDbErrors(
    UserModel.find({ role: "coordinator", groupId: null })
  );
  if (!coordinators || coordinators.length === 0) {
    throw new CustomFail("No unassigned coordinators found");
  }
  res.json(new CustomSuccess(coordinators));
}

/**
 * @method get
 * @route : ~/api/user/unassignedambassadors
 * @desc  : get ambassadors that are not assigned to any group
 * @access : admin
 */
async function getUnassignedAmbassadorsController(req, res) {
  const ambassadors = await catchDbErrors(
    UserModel.find({ role: "ambassador", groupId: null })
  );
  if (!ambassadors || ambassadors.length === 0) {
    throw new CustomFail("No unassigned ambassadors found");
  }
  res.json(new CustomSuccess(ambassadors));
}

/**
 * @method get
 * @route : ~/api/user/me
 * @desc  : get user details
 * @access : user
 */
async function getUserDetailsController(req, res) {
  const user = await catchDbErrors(
    UserModel.findById(req.user.id).select("-password")
  );
  if (!user) {
    throw new CustomFail("User not found");
  }
  res.json(new CustomSuccess(user));
}

/**
 * @method put
 * @route : ~/api/user/lastspinTime
 * @desc  : update the last spin time of the user date now + 24 hours
 * @access : user
 */
async function updateLastSpinTimeController(req, res) {
  const updatedUser = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      req.user.id,
      { lastSpinTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { new: true }
    )
  );
  res.json(new CustomSuccess(updatedUser));
}

module.exports = {
  userUpdateProfileController,
  updateUserImageController,
  updateCoinsEarnedController,
  updateUserRoleController,
  getAllUsersController,
  getUsersWithNoOrderController,
  getCoordinatorsController,
  getAmbassadorsController,
  getUsersController,
  deleteUserController,
  getUsersWithBirthdayController,
  getUnassignedCoordinatorsController,
  getUnassignedAmbassadorsController,
  getUserDetailsController,
  updateLastSpinTimeController,
};
