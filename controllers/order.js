const OrderModel = require("../models/order");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");
const ProductModel = require("../models/product");
const NotificationModel = require("../models/notification");
const UserModel = require("../models/user");

/**
 * @method : post
 * @route : ~/api/order/postorder
 * @desc  : post new order and notify admin if stock is low, also update paymentTotal
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

  for (const item of orderedProducts) {
    const product = await catchDbErrors(ProductModel.findById(item.productId));
    if (!product) {
      throw new CustomFail(`Product with ID ${item.productId} not found.`);
    }

    if (product.countInStock < item.quantity) {
      throw new CustomFail(`Insufficient stock for product: ${product.name}`);
    }
  }

  for (const item of orderedProducts) {
    const product = await catchDbErrors(ProductModel.findById(item.productId));
    product.countInStock -= item.quantity;

    await catchDbErrors(product.save());

    if (product.countInStock < 5) {
      const existingNotification = await NotificationModel.findOne({
        message: `Product ${product.name} is running out of stock.`,
      });

      if (!existingNotification) {
        const adminUser = await UserModel.findOne({ role: "admin" });
        const newNotification = new NotificationModel({
          userId: adminUser._id,
          message: `Product ${product.name} is running out of stock.`,
        });
        await catchDbErrors(newNotification.save());
      }
    }
  }

  let paymentTotal = 0;
  orderedProducts.forEach((item) => {
    paymentTotal += item.totalPrice;
  });

  const newOrder = await catchDbErrors(
    OrderModel.create({
      userId: user._id,
      orderedProducts,
      address,
      paymentMode,
      paymentTotal,
      status: "pending",
    })
  );

  if (!newOrder) {
    throw new CustomFail("Failed to create a new order. Please try again.");
  }

  res.json(new CustomSuccess(newOrder));
}

/**
 * @method : get
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
 * @method : get
 * @route : ~/api/order/userorders
 * @desc  : get user orders
 * @access : user admin
 */
async function getuserOrdersController(req, res) {
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
 * @method : get
 * @route : ~/api/order/:id
 * @desc  : get single order
 * @access : user admin
 */
async function getSingleOrder(req, res) {
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
 * @method : put
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
  getuserOrdersController,
  getSingleOrder,
  updateOrderStatusController,
  postNewOrderController,
  deleteOrderController,
  deleteOrderByAdminController,
  getOrderByStatusController,
  getDoneOrdersByDateController,
  getTopUsersBasedOnOrdersController,
  getTopUsersBasedOnPaymentTotalController,
};
