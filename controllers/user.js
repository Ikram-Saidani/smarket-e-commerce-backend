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

/**
 * @method get
 * @endpoint  ~/api/user/firstorder
 * @description get users that have not made any order
 * @access admin
 */

/**
 * @method get
 * @endpoint  ~/api/user/coordinators
 * @description get coordinators
 * @access admin
 */

/**
 * @method get
 * @endpoint  ~/api/user/ambassadors
 * @description get ambassadors
 * @access admin
 */

/**
 * @method get
 * @endpoint  ~/api/user/users
 * @description get users
 * @access admin
 */

/**
 * @method delete
 * @endpoint  ~/api/user/delete/:id
 * @description delete user
 * @access admin
 */

module.exports = {
  userUpdateProfileController,
  updateUserImage,
  updateCoinsEarned,
  updateUserRole,
};
