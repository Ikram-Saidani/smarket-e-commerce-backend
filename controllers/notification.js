const NotificationModel = require("../models/notification");
const OrderModel = require("../models/order");
const ProductModel = require("../models/product");
const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomSuccess } = require("../utils/customResponses");

/**
 * @method get
 * @endpoint  ~/api/notification
 * @description get all notifications
 * @access users
 */
async function getNotificationsController(req, res) {
  const notifications = await catchDbErrors(
    NotificationModel.find({ userId: req.user._id })
  );
  if (!notifications || notifications.length === 0) {
    return res.json(new CustomSuccess("No notifications found."));
  }
  res.json(new CustomSuccess({ notifications }));
}

/**
 * @method post
 * @endpoint  ~/api/notification/ambassador
 * @description notify ambassador eligibility
 * @access admin
 */
async function notifyAmbassadorEligibilityController(req, res) {
  const eligibleUsers = await catchDbErrors(UserModel.find({ role: "user" }));

  for (const user of eligibleUsers) {
    const message =
      "You are eligible to become an ambassador! Please send us your email to get started.";
    await catchDbErrors(
      NotificationModel.create({
        userId: user._id,
        message,
      })
    );
  }

  res.json(new CustomSuccess("Ambassador reminders sent to users."));
}

/**
 * @method post
 * @endpoint  ~/api/notification/coordinator
 * @description notify coordinator eligibility
 * @access admin
 */
async function notifyCoordinatorEligibilityController(req, res) {
  const ambassadors = await catchDbErrors(
    UserModel.find({ role: "ambassador" })
  );

  for (const ambassador of ambassadors) {
    const orders = await catchDbErrors(
      OrderModel.find({ userId: ambassador._id })
    );

    const totalSpent = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    if (totalSpent >= 5000) {
      const message =
        "Congratulations! You are eligible to become a coordinator based on your order history.";

      await catchDbErrors(
        NotificationModel.create({
          userId: ambassador._id,
          message,
        })
      );
    }
  }

  res.json(
    new CustomSuccess(
      "Coordinator eligibility notifications sent to ambassadors."
    )
  );
}

/**
 * @method post
 * @endpoint  ~/api/notification/affordable
 * @description notify affordable products
 * @access admin
 */
async function notifyAffordableProductsController(req, res) {
  const users = await catchDbErrors(UserModel.find());

  for (const user of users) {
    const affordableProducts = await catchDbErrors(
      ProductModel.find({ price: { $lte: user.coinsEarned } })
    );

    for (const product of affordableProducts) {
      const message = `You can purchase "${product.title}" with your earned coins (${user.coinsEarned}).`;
      await catchDbErrors(
        NotificationModel.create({
          userId: user._id,
          message,
        })
      );
    }
  }

  res.json(new CustomSuccess("Affordable product suggestions sent to users."));
}

/**
 * @method post
 * @endpoint  ~/api/notification/firstorder
 * @description notify first order discount
 * @access admin
 */
async function notifyFirstOrderDiscountController(req, res) {
  const usersToNotify = await catchDbErrors(UserModel.find());

  for (const user of usersToNotify) {
    const orders = await catchDbErrors(OrderModel.find({ userId: user._id }));

    if (orders.length === 0) {
      const message =
        "Congratulations! You are eligible for a 20% discount on your first order.";

      await catchDbErrors(
        NotificationModel.create({
          userId: user._id,
          message,
        })
      );
    }
  }
  res.json(
    new CustomSuccess("First order discount notifications sent to users.")
  );
}

/**
 * @method post
 * @endpoint  ~/api/notification/coinsforhope
 * @description notify coins for hope
 * @access admin
 */
async function notifyCoinsForHopeController(req, res) {
  const users = await catchDbErrors(UserModel.find());

  for (const user of users) {
    const affordableProducts = await catchDbErrors(
      ProductModel.find({ coins: { $lte: user.coinsEarned } })
    );

    for (const product of affordableProducts) {
      const message = `You can use your earned coins (${user.coinsEarned}) to purchase "${product.title}". Keep spreading hope!`;
      await catchDbErrors(
        NotificationModel.create({
          userId: user._id,
          message,
        })
      );
    }
  }

  res.json(new CustomSuccess("Hope-related notifications sent to users."));
}

module.exports = {
  getNotificationsController,
  notifyAmbassadorEligibilityController,
  notifyAffordableProductsController,
  notifyCoinsForHopeController,
  notifyFirstOrderDiscountController,
  notifyCoordinatorEligibilityController,
};
