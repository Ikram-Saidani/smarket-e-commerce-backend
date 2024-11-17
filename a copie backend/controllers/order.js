const OrderModel = require("../models/order");
const catchDbErrors = require("../utils/catchDbErros");
const { customFail, customSuccess } = require("../utils/customResponses");
const ProductModel = require("../models/product");
// /**
//  * @method post
//  * @endpoint ~/api/order/placeOrder
//  * @description Place an order and update stock
//  * @access user
//  */
/*
const OrderModel = require("../models/order");
const ProductModel = require("../models/product");
const NotificationModel = require("../models/notification");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomSuccess, CustomFail } = require("../utils/customResponses");

async function placeOrderController(req, res) {
  const { orderItems } = req.body; // Assume orderItems is an array of product IDs and quantities

  // Check if each product in the order has sufficient stock
  for (let item of orderItems) {
      const product = await catchDbErrors(ProductModel.findById(item.productId));
      if (!product) {
          throw new CustomFail(`Product ${item.productId} not found.`);
      }

      if (product.countInStock < item.quantity) {
          throw new CustomFail(`Insufficient stock for product: ${product.name}`);
      }

      // Update the stock
      product.countInStock -= item.quantity;
      await catchDbErrors(product.save());

      // Check if the stock is below 5 and create a notification if necessary
      if (product.countInStock < 5) {
          const existingNotification = await NotificationModel.findOne({
              "message": `Product ${product.name} is running out of stock`,
          });

          if (!existingNotification) {
              const newNotification = new NotificationModel({
                  userId: req.user._id, // Assuming user is the admin
                  message: `Product ${product.name} is running out of stock`,
              });
              await catchDbErrors(newNotification.save());
          }
      }
  }

  // After all stock updates and checks, create the order
  const newOrder = new OrderModel({
      userId: req.user._id,
      items: orderItems,
      status: "pending",
      // other order details
  });

  await catchDbErrors(newOrder.save());

  res.json(new CustomSuccess("Order placed successfully."));
}

module.exports = { placeOrderController };

*/


/**
 * @method : get
 * @route : ~/api/order/
 * @desc  : get all Orders
 * @access : admin
 */
async function getAllOrdersController(req, res) {
  const orders = await catchDbErrors(OrderModel.find().populate("userId"));
  if (!orders.length) {
    throw new customFail("no orders found");
  }
  res.json(new customSuccess(orders));
}

/**
 * @method : get
 * @route : ~/api/order/userorders
 * @desc  : get user Orders
 * @access : user
 */
async function getuserOrdersController(req, res) {
  const user = req.user;
  const userOrders = await catchDbErrors(
    OrderModel.find({ userId: user._id }).populate({
      path: "orderdProducts",
      populate: {
        path: "productId",
        model: "product",
      },
    })
  );
  if (!userOrders.length) {
    throw new customFail("no orders");
  }
  res.json(new customSuccess(userOrders));
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
      { returnDocument: "after", runValidators: true }
    )
  );
  if (!order) {
    throw new customFail("order not found");
  }
  if (order.status == "done") {
    order.orderdProducts.map(
      async (item) =>
        await catchDbErrors(
          ProductModel.findByIdAndUpdate(item.productId._id, {
            $inc: { saleCount: item.quantity },
          })
        )
    );
  }
  res.json(new customSuccess(order));
}

/**
 * @method : get
 * @route : ~/api/order/:id
 * @desc  : get single order
 * @access : admin
 */
async function getSingleOrder(req, res) {
  const order = await catchDbErrors(
    OrderModel.findById(req.params.id).populate({
      path: "orderdProducts",
      populate: {
        path: "productId",
      },
    })
  );
  if (!order) {
    throw new customFail("order not found");
  }
  res.json(new customSuccess(order));
}

/**
 * @method : post
 * @route : ~/api/order/postorder
 * @desc  : post new order order
 * @access : user
 */
async function postNewOrderContoroller(req, res) {
  const user = req.user;
  const newOrder = await catchDbErrors(
    OrderModel.create({
      userId: user._id,
      orderdProducts: req.body.orderdProducts,
      address: req.body.address,
      paymentMethod: req.body.paymentMethod,
    })
  );
  if (!newOrder) {
    throw new customFail("somthing went wrong");
  }
  res.json(new customSuccess(newOrder));
}
module.exports = {
  getAllOrdersController,
  getuserOrdersController,
  getSingleOrder,
  updateOrderStatusController,
  postNewOrderContoroller,
};
