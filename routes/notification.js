const {
  getNotificationsController,
  notifyAmbassadorEligibilityController,
  notifyAffordableProductsController,
  notifyCoinsForHopeController,
  notifyFirstOrderDiscountController,notifyCoordinatorEligibilityController,
  notifyBirthdayCoinsController
} = require("../controllers/notification");
const asyncHandler = require("../utils/asyncHandler");
const verifyAdmin = require("../utils/verifyAdmin");
const NotificationRouter = require("express").Router();
const verifyUser = require("../utils/verifyUser");

/**
 * @method get
 * @endpoint  ~/api/notification
 * @description get all user's notifications
 * @access user
 */
NotificationRouter.get(
  "/",
  asyncHandler(verifyUser),
  asyncHandler(getNotificationsController)
);

/**
 * @method post
 * @endpoint  ~/api/notification/ambassador
 * @description notify ambassador eligibility
 * @access admin
 */
NotificationRouter.post(
  "/ambassador",
  asyncHandler(verifyAdmin),
  asyncHandler(notifyAmbassadorEligibilityController)
);

/**
 * @method post
 * @endpoint  ~/api/notification/coordinator
 * @description notify coordinator eligibility
 * @access admin
 */
NotificationRouter.post(
    "/coordinator",
    asyncHandler(verifyAdmin),
    asyncHandler(notifyCoordinatorEligibilityController)
  );

/**
 * @method post
 * @endpoint  ~/api/notification/affordable
 * @description notify affordable products
 * @access admin
 */
NotificationRouter.post(
  "/affordable",
  asyncHandler(verifyAdmin),
  asyncHandler(notifyAffordableProductsController)
);

/**
 * @method post
 * @endpoint  ~/api/notification/firstorder
 * @description notify first order discount
 * @access admin
 */
NotificationRouter.post(
  "/firstorder",
  asyncHandler(verifyAdmin),
  asyncHandler(notifyFirstOrderDiscountController)
);

/**
 * @method post
 * @endpoint  ~/api/notification/coinsforhope
 * @description notify coins for hope
 * @access admin
 */
NotificationRouter.post(
  "/coinsforhope",
  asyncHandler(verifyAdmin),
  asyncHandler(notifyCoinsForHopeController)
);

/**
 * @method post
 * @endpoint  ~/api/notification/birthday
 * @description notify users that they earned 5%discount because of their birthday month
 * @access admin
 */
NotificationRouter.post(
  "/birthday",
  asyncHandler(verifyAdmin),
  asyncHandler(notifyBirthdayCoinsController)
);

module.exports = NotificationRouter;
