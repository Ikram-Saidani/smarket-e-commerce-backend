const {
  userUpdateProfileController,
  updateUserImage,
  updateCoinsEarned,updateUserRole
} = require("../controllers/user");
const asyncHandler = require("../utils/asyncHandler");
const verifyAdmin = require("../utils/verifyAdmin");
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

/**
 * @method put
 * @endpoint ~/api/user/coinsearned/:id
 * @description update coins earned by user
 * @access user
 */
UserRouter.put(
  "/coinsearned/:id",
  asyncHandler(verifyUser),
  asyncHandler(updateCoinsEarned)
);

/**
 * @method put
 * @endpoint ~/api/user/role/:id
 * @description update user's role by admin
 * @access admin
 */
UserRouter.put("/role/:id",
asyncHandler(verifyAdmin),
asyncHandler(updateUserRole)
);

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
module.exports = UserRouter;
