const DonationHistoryModel = require("../models/donationHistory");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const ProductModel = require("../models/product");
const NotificationModel = require("../models/notification");
const UserModel = require("../models/user");

/**
 * @method post
 * @route : ~/api/donationHistory/postDonationHistory
 * @desc  : Post a new donationHistory, update coinsDonated, check coinsEarned, and notify admin if stock is low.
 * @access : user
 */
async function postNewDonationHistoryController(req, res) {
  const { orderDonation } = req.body;
  const user = req.user;

  if (!orderDonation || !orderDonation.length) {
    throw new CustomFail("orderDonation is required and cannot be empty.");
  }

  let coinsEarned = user.coinsEarned || 0;

  const totalCoinsNeeded = orderDonation.reduce(
    (sum, item) => sum + item.totalCoins,
    0
  );

  if (coinsEarned < totalCoinsNeeded) {
    throw new CustomFail("Insufficient coinsEarned to complete this donation.");
  }

  const notifications = [];
  const productUpdates = orderDonation.map(async (item) => {
    const product = await catchDbErrors(ProductModel.findById(item.productId));
    if (!product) {
      throw new CustomFail(`Product with ID ${item.productId} not found.`);
    }

    if (product.countInStock < item.quantity) {
      throw new CustomFail(`Insufficient stock for product: ${product.name}`);
    }

    product.countInStock -= item.quantity;
    await catchDbErrors(product.save());

    if (product.countInStock < 5) {
      const existingNotification = await NotificationModel.findOne({
        message: `Product ${product.name} is running out of stock.`,
      });

      if (!existingNotification) {
        const adminUser = await UserModel.findOne({ role: "admin" });
        notifications.push({
          userId: adminUser._id,
          message: `Product ${product.name} is running out of stock.`,
        });
      }
    }
  });

  await Promise.all(productUpdates);

  if (notifications.length > 0) {
    await NotificationModel.insertMany(notifications);
  }

  coinsEarned -= totalCoinsNeeded;
  await catchDbErrors(UserModel.findByIdAndUpdate(user._id, { coinsEarned }));

  const newDonationHistory = await catchDbErrors(
    DonationHistoryModel.create({
      userId: user._id,
      orderDonation,
      coinsDonated: totalCoinsNeeded,
    })
  );

  if (!newDonationHistory) {
    throw new CustomFail(
      "Failed to create a new donationHistory. Please try again."
    );
  }

  res.json(new CustomSuccess(newDonationHistory));
}

/**
 * @method get
 * @route : ~/api/donationHistory
 * @desc  : get all donationHistories
 * @access : admin
 */
async function getAllDonationHistoriesController(req, res) {
  const donationHistories = await catchDbErrors(
    DonationHistoryModel.find().populate("userId")
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
    DonationHistoryModel.find({ userId: user._id }).populate({
      path: "orderDonation",
      populate: {
        path: "productId",
        model: "product",
      },
    })
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
    DonationHistoryModel.findById(req.params.id).populate({
      path: "orderDonation",
      populate: {
        path: "productId",
      },
    })
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
 * @endpoint ~/api/donationHistory/done/:date
 * @description Filter done donationHistories for a specific month and year
 * @access admin
 */
async function getDonationHistoriesByDateController(req, res) {
  const { date } = req.params;
  const [year, monthNum] = date.split("-").map(Number);

  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new CustomFail("Invalid month format. Use 'YYYY-MM'.");
  }

  const donationHistories = await catchDbErrors(
    DonationHistoryModel.find({
      status: "done",
      createdAt: {
        $gte: new Date(year, monthNum - 1, 1),
        $lt: new Date(year, monthNum, 1),
      },
    }).populate("userId")
  );

  if (!donationHistories.length) {
    throw new CustomFail("No donationHistories found for the specified month.");
  }

  res.json(new CustomSuccess(donationHistories));
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
  const donationHistories = await catchDbErrors(DonationHistoryModel.find());
  if (!donationHistories.length) {
    throw new CustomFail("no donationHistories found");
  }

  const users = {};
  for (const donationHistory of donationHistories) {
    if (!users[donationHistory.userId]) {
      users[donationHistory.userId] = 0;
    }
    users[donationHistory.userId] += donationHistory.coinsDonated;
  }

  const topUsers = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, coinsDonated]) => ({
      userId,
      coinsDonated,
    }));

  res.json(new CustomSuccess(topUsers));
}

module.exports = {
  postNewDonationHistoryController,
  getAllDonationHistoriesController,
  getUserDonationHistoriesController,
  getSingleDonationHistoryController,
  deleteDonationHistoryByAdminController,
  getDonationHistoriesByDateController,
  getTopUsersBasedOnDonationHistoriesController,
  getTopUsersBasedOnCoinsDonatedController,
};
