const DonationHistoryModel = require("../models/donationHistory");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const NotificationModel = require("../models/notification");
const UserModel = require("../models/user");
const HelpAndHopeModel = require("../models/helpAndHope");

/**
 * @method post
 * @route : ~/api/donationHistory/postDonationHistory
 * @desc  : Post a new donationHistory, check coinsEarned, and notify the user that their donation is done.
 * @access : user
 */
async function postNewDonationHistoryController(req, res) {
  const { productDonated } = req.body; // Product sent from frontend
  const user = req.user;
  if (!productDonated) {
    throw new CustomFail("productDonated is required and cannot be empty.");
  }

  const product = await catchDbErrors(
    HelpAndHopeModel.findById(productDonated)
  );

  if (!product) {
    throw new CustomFail("Product does not exist.");
  }

  const totalCoinsNeeded = product.coins;
  if (user.coinsEarned < totalCoinsNeeded) {
    throw new CustomFail("Insufficient coins to complete this donation.");
  }

  const updatedCoinsEarned = user.coinsEarned - totalCoinsNeeded;

  const updateUserResult = await catchDbErrors(
    UserModel.findByIdAndUpdate(
      user._id,
      { coinsEarned: updatedCoinsEarned },
      { new: true, runValidators: true }
    )
  );

  if (!updateUserResult) {
    throw new CustomFail("Failed to update user coins. Please try again.");
  }

  const newDonationHistory = await catchDbErrors(
    DonationHistoryModel.create({
      userId: user._id,
      productDonated,
    })
  );

  if (!newDonationHistory) {
    throw new CustomFail("Failed to create a new donation record.");
  }

  const newNotification = await catchDbErrors(
    NotificationModel.create({
      userId: user._id,
      message: `Thank you for your donation of ${totalCoinsNeeded} coins!`,
    })
  );

  if (!newNotification) {
    throw new CustomFail("Failed to create a notification for the user.");
  }

  res.status(201).json({
    status: "success",
    data: {
      message: "Donation successfully recorded!",
      donationHistory: newDonationHistory,
      remainingCoins: updateUserResult.coinsEarned,
    },
  });
}

/**
 * @method get
 * @route : ~/api/donationHistory
 * @desc  : get all donationHistories
 * @access : admin
 */
async function getAllDonationHistoriesController(req, res) {
  const donationHistories = await catchDbErrors(
    DonationHistoryModel.find().populate("userId productDonated")
  );
  if (!donationHistories.length) {
    throw new CustomFail("no donationHistories found");
  }
  res.json(new CustomSuccess(donationHistories));
}

/**
 * @method get
 * @route : ~/api/donationHistory/userdonationHistories
 * @desc  : get user donationHistories
 * @access : user admin
 */
async function getUserDonationHistoriesController(req, res) {
  const user = req.user;
  const userdonationHistories = await catchDbErrors(
    DonationHistoryModel.find({ userId: user._id }).populate("productDonated")
  );
  if (!userdonationHistories.length) {
    throw new CustomFail("no donationHistories");
  }
  res.json(new CustomSuccess(userdonationHistories));
}

/**
 * @method get
 * @route : ~/api/donationHistory/:id
 * @desc  : get single donationHistory
 * @access : user admin
 */
async function getSingleDonationHistoryController(req, res) {
  const donationHistory = await catchDbErrors(
    DonationHistoryModel.findById(req.params.id).populate("productDonated")
  );
  if (!donationHistory) {
    throw new CustomFail("donationHistory not found");
  }
  res.json(new CustomSuccess(donationHistory));
}

/**
 * @method delete
 * @endpoint ~/api/donationHistory/deleteadmin/:id
 * @description delete donationHistory by admin
 * @access admin
 */
async function deleteDonationHistoryByAdminController(req, res) {
  const donationHistory = await catchDbErrors(
    DonationHistoryModel.findById(req.params.id)
  );
  if (!donationHistory) {
    throw new CustomFail("donationHistory not found");
  }
  await catchDbErrors(DonationHistoryModel.findByIdAndDelete(req.params.id));
  res.json(new CustomSuccess("donationHistory deleted"));
}

/**
 * @method get
 * @endpoint ~/api/donationHistory/topusers/donationHistories
 * @description Get Top Users Based on donationHistories
 * @access admin
 */
async function getTopUsersBasedOnDonationHistoriesController(req, res) {
  const donationHistories = await catchDbErrors(DonationHistoryModel.find());
  if (!donationHistories.length) {
    throw new CustomFail("no donationHistories found");
  }

  const users = {};
  for (const donationHistory of donationHistories) {
    if (!users[donationHistory.userId]) {
      users[donationHistory.userId] = 0;
    }
    users[donationHistory.userId]++;
  }

  const topUsers = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, donationHistoryCount]) => ({
      userId,
      donationHistoryCount,
    }));

  res.json(new CustomSuccess(topUsers));
}

/**
 * @method get
 * @endpoint ~/api/donationHistory/topusers/coinsDonated
 * @description Get Top Users Based on coinsDonated
 * @access admin
 */
async function getTopUsersBasedOnCoinsDonatedController(req, res) {
  const donationHistories = await catchDbErrors(
    DonationHistoryModel.find().populate("userId productDonated")
  );
  if (!donationHistories.length) {
    throw new CustomFail("no donationHistories found");
  }

  const users = {};
  for (const donationHistory of donationHistories) {
    if (!users[donationHistory.userId]) {
      users[donationHistory.userId] = 0;
    }
    users[donationHistory.userId] += donationHistory.productDonated.coins;
  }
  const topUsers = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, coinsDonated]) => ({
      userId,
      coinsDonated,
    }));

  res.json(new CustomSuccess(topUsers));
}

/**
 * @method get
 * @route : ~/api/donationHistory/status/false
 * @desc  : get donation with status false
 * @access : admin
 */
async function getNotCompletedDonationHistoriesController(req, res) {
  const donationHistories = await catchDbErrors(
    DonationHistoryModel.find({ status: false }).populate(
      "userId productDonated"
    )
  );
  if (!donationHistories.length) {
    throw new CustomFail("no donationHistories found");
  }
  res.json(new CustomSuccess(donationHistories));
}

/**
 * @method put
 * @route : ~/api/donationHistory/:id
 * @desc  : update donation status to true
 * @access : admin
 */
async function updateDonationHistoryStatusController(req, res) {
  const donationHistory = await catchDbErrors(
    DonationHistoryModel.findByIdAndUpdate(
      req.params.id,
      { status: true },
      { new: true, runValidators: true }
    )
  );
  if (!donationHistory) {
    throw new CustomFail("donationHistory not found");
  }
  res.json(new CustomSuccess("donationHistory status updated"));
}

module.exports = {
  postNewDonationHistoryController,
  getAllDonationHistoriesController,
  getUserDonationHistoriesController,
  getSingleDonationHistoryController,
  deleteDonationHistoryByAdminController,
  getTopUsersBasedOnDonationHistoriesController,
  updateDonationHistoryStatusController,
  getTopUsersBasedOnCoinsDonatedController,
  getNotCompletedDonationHistoriesController,
};
