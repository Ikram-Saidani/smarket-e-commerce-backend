const {
  userUpdateProfileController,
  updateUserImage,
} = require("../controllers/user");
const asyncHandler = require("../utils/asyncHandler");
const verifyUser = require("../utils/verifyUser");
const multer = require("multer");
const UserRouter = require("express").Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = `uploads/avatars/${req.user._id}`;

    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, `avatar-${uniqueSuffix}.${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG and PNG images are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

/**
 * @method put
 * @endpoint ~/api/user/update/:id
 * @description update user profile (without image)
 * @access user
 */
UserRouter.put(
  "/update/:id",
  asyncHandler(verifyUser),
  asyncHandler(userUpdateProfileController)
);

/**
 * @method put
 * @endpoint ~/api/user/updateimage/:id
 * @description update user's image
 * @access user
 */
UserRouter.put(
  "/updateimage/:id",
  asyncHandler(verifyUser),
  upload.single("avatar"),
  asyncHandler(updateUserImage)
);

module.exports = UserRouter;
