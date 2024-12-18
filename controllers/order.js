const OrderModel = require("../models/order");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const ProductModel = require("../models/product");
const NotificationModel = require("../models/notification");
const UserModel = require("../models/user");
const GroupModel = require("../models/group");

/**
 * @method post
 * @route : ~/api/order/postorder
 * @desc  : Post a new order, apply user discounts automatically, notify admin if stock is low, and update paymentTotal.
 * @access : user
 */
async function postNewOrderController(req, res) {
  const { orderedProducts, address, paymentMode } = req.body;
  const user = req.user;
  if (!orderedProducts || !address || !paymentMode) {
    throw new CustomFail(
      "All fields (orderedProducts, address, paymentMode) are required."
    );
  }
  // Initialize total payment and total price
  let paymentTotal = 0;
  let discountUsed = 0;
  let totalPrice = 0;

  // Calculate total price of ordered products
  for (const item of orderedProducts) {
    const product = await catchDbErrors(ProductModel.findById(item.productId));
    if (!product)
      throw new CustomFail(`Product with ID ${item.productId} not found.`);

    // Check and update stock
    if (product.countInStock < item.quantity) {
      throw new CustomFail(`Insufficient stock for product: ${product.name}`);
    }
    if(item.category==="fashion"){
     product.size.map((size) => {
      if (size.size === item.selectedSize) {
        size.quantity -= item.quantity;
      }
    });
    }else if(item.category==="footwear"){
      product.shoesize.map((shoesize) => {
        if (shoesize.shoesize === item.selectedSize) {
          shoesize.quantity -= item.quantity;
        }
      });
    }
    product.countInStock -= item.quantity;
    await catchDbErrors(
      ProductModel.updateOne(
        { _id: item.productId },
        { countInStock: product.countInStock }
      )
    );
    

    // Notify admin if stock is low
    if (product.countInStock < 5) {
      const notificationExists = await NotificationModel.exists({
        message: `Product ${product.name} is running out of stock.`,
      });

      if (!notificationExists) {
        const adminUser = await UserModel.findOne({ role: "admin" });
        if (adminUser) {
          await catchDbErrors(
            NotificationModel.create({
              userId: adminUser._id,
              message: `Product ${product.name} is running out of stock.`,
            })
          );
        }
      }
    }

    totalPrice += item.quantity * product.price;
  }

  // Initialize payment total as the total price
  paymentTotal = totalPrice;
  // Apply user discount if available
  if (user.discountEarnedWithGroup > 0) {
    discountUsed += user.discountEarnedWithGroup;
    paymentTotal =
      paymentTotal - (paymentTotal * user.discountEarnedWithGroup) / 100;
    user.discountEarnedWithGroup = 0;
    await catchDbErrors(
      UserModel.updateOne({ _id: user._id }, { discountEarnedWithGroup: 0 })
    );
  }

  // Apply 5% discount for birth month
  if (user.dateOfBirth) {
    const userBirthday = new Date(user.dateOfBirth);
    const today = new Date();
    if (userBirthday.getMonth() === today.getMonth()) {
      discountUsed += 5;
      paymentTotal -= (paymentTotal * 5) / 100;
    }
  }
//if admin/coordinator/ambassador
  if (
    user.role === "coordinator" ||
    user.role === "ambassador" ||
    user.role === "admin"
  ) {
    discountUsed += 20;
    paymentTotal -= (paymentTotal * 20) / 100;
  }
  
  // Apply 20% discount for first order
  const userOrders = await catchDbErrors(OrderModel.find({ userId: user._id }));
  if (!userOrders.length) {
    discountUsed += 20;
    paymentTotal -= (paymentTotal * 20) / 100;
  }
  //add shipping cost
  paymentTotal += paymentTotal < 500 ? 5 : 0;
  // Final total payment
  paymentTotal = Math.max(0, paymentTotal);
  // Create new order
  const newOrder = await catchDbErrors(
    OrderModel.create({
      userId: user._id,
      orderedProducts,
      address,
      paymentMode,
      paymentTotal,
      discountApplied: discountUsed,
      status: "pending",
    })
  );
  if (!newOrder) {
    throw new CustomFail("Failed to create a new order. Please try again.");
  }

  //update user earned coins in the user collection
  user.coinsEarned += paymentTotal * 0.1;
  await catchDbErrors(
    UserModel.updateOne({ _id: user._id }, { coinsEarned: user.coinsEarned })
  );

  // Notify user about applied discount and the earned coins
  await catchDbErrors(
    NotificationModel.create({
      userId: user._id,
      message: `You have earned ${
        (paymentTotal * 0.1).toFixed(2)
      } coins for this order. You have used ${discountUsed}% discount.`,
    })
  );

  // Send response
  res.json(
    new CustomSuccess({
      message: "Order placed successfully.",
      order: newOrder,
      discountApplied: discountUsed,
    })
  );
}

/**
 * @method get
 * @route : ~/api/order
 * @desc  : get all orders
 * @access : admin
 */
async function getAllOrdersController(req, res) {
  const orders = await catchDbErrors(OrderModel.find().populate("userId"));
  if (!orders.length) {
    throw new CustomFail("no orders found");
  }
  res.json(new CustomSuccess(orders));
}

/**
 * @method get
 * @route : ~/api/order/userorders
 * @desc  : get user orders
 * @access : user admin
 */
async function getUserOrdersController(req, res) {
  const user = req.user;
  const userOrders = await catchDbErrors(
    OrderModel.find({ userId: user._id }).populate({
      path: "orderedProducts",
      populate: {
        path: "productId",
        model: "product",
      },
    })
  );
  if (!userOrders.length) {
    throw new CustomFail("no orders");
  }
  res.json(new CustomSuccess(userOrders));
}

/**
 * @method get
 * @route : ~/api/order/:id
 * @desc  : get single order
 * @access : user admin
 */
async function getSingleOrderController(req, res) {
  const order = await catchDbErrors(
    OrderModel.findById(req.params.id).populate({
      path: "orderedProducts",
      populate: {
        path: "productId",
      },
    })
  );
  if (!order) {
    throw new CustomFail("order not found");
  }
  res.json(new CustomSuccess(order));
}

/**
 * @method put
 * @route : ~/api/order/updateorder/:id
 * @desc  : update order status
 * @access : admin
 */
async function updateOrderStatusController(req, res) {
  const order = await catchDbErrors(
    OrderModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
  );
  if (!order) {
    throw new CustomFail("order not found");
  }
  if (order.status == "done") {
    order.orderedProducts.map(
      async (item) =>
        await catchDbErrors(
          ProductModel.findByIdAndUpdate(item.productId._id, {
            $inc: { saleCount: item.quantity },
          })
        )
    );
  }
  res.json(new CustomSuccess(order));
}

/**
 * @method delete
 * @endpoint ~/api/order/delete/:id
 * @description delete order while status is pending
 * @access user
 */
async function deleteOrderController(req, res) {
  const order = await catchDbErrors(OrderModel.findById(req.params.id));
  if (!order) {
    throw new CustomFail("order not found");
  }
  if (order.status !== "pending") {
    throw new CustomFail("order status is not pending");
  }
  await catchDbErrors(OrderModel.findByIdAndDelete(req.params.id));
  res.json(new CustomSuccess("order deleted"));
}

/**
 * @method delete
 * @endpoint ~/api/order/deleteadmin/:id
 * @description delete order by admin
 * @access admin
 */
async function deleteOrderByAdminController(req, res) {
  const order = await catchDbErrors(OrderModel.findById(req.params.id));
  if (!order) {
    throw new CustomFail("order not found");
  }
  await catchDbErrors(OrderModel.findByIdAndDelete(req.params.id));
  res.json(new CustomSuccess("order deleted"));
}

/**
 * @method get
 * @endpoint ~/api/order/status/:status
 * @description get order with status filter
 * @access admin
 */
async function getOrderByStatusController(req, res) {
  const orders = await catchDbErrors(
    OrderModel.find({ status: req.params.status }).populate("userId")
  );
  if (!orders.length) {
    throw new CustomFail("no orders found");
  }
  res.json(new CustomSuccess(orders));
}

/**
 * @method get
 * @endpoint ~/api/order/done/:date
 * @description Filter done orders for a specific month and year
 * @access admin
 */
async function getDoneOrdersByDateController(req, res) {
  const { date } = req.params;
  const [year, monthNum] = date.split("-").map(Number);

  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new CustomFail("Invalid month format. Use 'YYYY-MM'.");
  }

  const orders = await catchDbErrors(
    OrderModel.find({
      status: "done",
      createdAt: {
        $gte: new Date(year, monthNum - 1, 1),
        $lt: new Date(year, monthNum, 1),
      },
    }).populate("userId")
  );

  if (!orders.length) {
    throw new CustomFail("No orders found for the specified month.");
  }

  res.json(new CustomSuccess(orders));
}
/**
 * @method get
 * @endpoint ~/api/order/topusers/orders
 * @description Get Top Users Based on Orders
 * @access admin
 */
async function getTopUsersBasedOnOrdersController(req, res) {
  const orders = await catchDbErrors(OrderModel.find());
  if (!orders.length) {
    throw new CustomFail("no orders found");
  }

  const users = {};
  for (const order of orders) {
    if (!users[order.userId]) {
      users[order.userId] = 0;
    }
    users[order.userId]++;
  }

  const topUsers = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, orderCount]) => ({
      userId,
      orderCount,
    }));

  res.json(new CustomSuccess(topUsers));
}

/**
 * @method get
 * @endpoint ~/api/order/topusers/paymenttotal
 * @description Get Top Users Based on paymentTotal
 * @access admin
 */
async function getTopUsersBasedOnPaymentTotalController(req, res) {
  const orders = await catchDbErrors(OrderModel.find());
  if (!orders.length) {
    throw new CustomFail("no orders found");
  }

  const users = {};
  for (const order of orders) {
    if (!users[order.userId]) {
      users[order.userId] = 0;
    }
    users[order.userId] += order.paymentTotal;
  }

  const topUsers = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, paymentTotal]) => ({
      userId,
      paymentTotal,
    }));

  res.json(new CustomSuccess(topUsers));
}

module.exports = {
  getAllOrdersController,
  getUserOrdersController,
  getSingleOrderController,
  updateOrderStatusController,
  postNewOrderController,
  deleteOrderController,
  deleteOrderByAdminController,
  getOrderByStatusController,
  getDoneOrdersByDateController,
  getTopUsersBasedOnOrdersController,
  getTopUsersBasedOnPaymentTotalController,
};
