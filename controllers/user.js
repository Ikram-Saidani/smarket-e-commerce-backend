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
      UserModel.findByIdAndUpdate(
        req.user._id,
        { $push: { address: req.body.address } },
        { new: true }
      )
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

module.exports = { userUpdateProfileController, updateUserImage };
