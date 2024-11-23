const {
  postNewDonationHistoryController,
  getAllDonationHistoriesController,
  getUserDonationHistoriesController,
  getSingleDonationHistoryController,
  deleteDonationHistoryByAdminController,
  getDonationHistoriesByDateController,
  getTopUsersBasedOnDonationHistoriesController,
  getTopUsersBasedOnCoinsDonatedController,
} = require("../controllers/donationHistory");
const asyncHandler = require("../utils/asyncHandler");
const donationHistoryRouter = require("express").Router();
const verifyAdmin = require("../utils/verifyAdmin");
const verifyUser = require("../utils/verifyUser");

/**
 * @method post
 * @route : ~/api/donationHistory/postDonationHistory
 * @desc  : Post a new donationHistory, update coinsDonated, check coinsEarned, and notify user that his donation is done.
 * @access : user
 */
donationHistoryRouter.post(
  "/postDonationHistory",
  asyncHandler(verifyUser),
  asyncHandler(postNewDonationHistoryController)
);

/**
 * @method get
 * @route : ~/api/donationHistory
 * @desc  : get all donationHistories
 * @access : admin
 */
donationHistoryRouter.get(
  "/",
  asyncHandler(verifyAdmin),
  asyncHandler(getAllDonationHistoriesController)
);

/**
 * @method get
 * @route : ~/api/donationHistory/userdonationHistories
 * @desc  : get user donationHistories
 * @access : user admin
 */
donationHistoryRouter.get(
  "/userdonationHistories",
  asyncHandler(verifyUser),
  asyncHandler(getUserDonationHistoriesController)
);

/**
 * @method get
 * @route : ~/api/donationHistory/:id
 * @desc  : get single donationHistory
 * @access : user admin
 */
donationHistoryRouter.get(
  "/:id",
  asyncHandler(verifyUser),
  asyncHandler(getSingleDonationHistoryController)
);

/**
 * @method delete
 * @endpoint ~/api/donationHistory/deleteadmin/:id
 * @description delete donationHistory by admin
 * @access admin
 */
donationHistoryRouter.delete(
  "/deleteadmin/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteDonationHistoryByAdminController)
);

/**
 * @method get
 * @endpoint ~/api/donationHistory/done/:date
 * @description Filter done donationHistories for a specific month and year
 * @access admin
 */
donationHistoryRouter.get(
  "/done/:date",
  asyncHandler(verifyAdmin),
  asyncHandler(getDonationHistoriesByDateController)
);

/**
 * @method get
 * @endpoint ~/api/donationHistory/topusers/donationHistories
 * @description Get Top Users Based on donationHistories
 * @access admin
 */
donationHistoryRouter.get(
  "/topusers/donationHistories",
  asyncHandler(verifyAdmin),
  asyncHandler(getTopUsersBasedOnDonationHistoriesController)
);

/**
 * @method get
 * @endpoint ~/api/donationHistory/topusers/coinsDonated
 * @description Get Top Users Based on coinsDonated
 * @access admin
 */
donationHistoryRouter.get(
  "/topusers/coinsDonated",
  asyncHandler(verifyAdmin),
  asyncHandler(getTopUsersBasedOnCoinsDonatedController)
);

module.exports = donationHistoryRouter;
