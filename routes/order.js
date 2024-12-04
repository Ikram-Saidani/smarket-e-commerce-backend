const {
  getAllOrdersController,
  getUserOrdersController,
  updateOrderStatusController,
  postNewOrderController,
  getSingleOrderController,
  deleteOrderController,
  deleteOrderByAdminController,
  getOrderByStatusController,
  getDoneOrdersByDateController,
  getTopUsersBasedOnOrdersController,
  getTopUsersBasedOnPaymentTotalController,
} = require("../controllers/order");
const asyncHandler = require("../utils/asyncHandler");
const OrderRouter = require("express").Router();
const verifyAdmin = require("../utils/verifyAdmin");
const verifyUser = require("../utils/verifyUser");

/**
 * @method post
 * @route : ~/api/order/postorder
 * @desc  : Post a new order, apply user discounts automatically, notify admin if stock is low, and update paymentTotal.
 * @access : user
 */
OrderRouter.post(
  "/postorder",
  asyncHandler(verifyUser),
  asyncHandler(postNewOrderController)
);

/**
 * @method get
 * @route : ~/api/order
 * @desc  : get all orders
 * @access : admin
 */
OrderRouter.get(
  "/",
  asyncHandler(verifyAdmin),
  asyncHandler(getAllOrdersController)
);

/**
 * @method get
 * @route : ~/api/order/userorders
 * @desc  : get user orders
 * @access : user admin
 */
OrderRouter.get(
  "/userorders",
  asyncHandler(verifyUser),
  asyncHandler(getUserOrdersController)
);

/**
 * @method get
 * @route : ~/api/order/:id
 * @desc  : get single order
 * @access : user admin
 */
OrderRouter.get(
  "/:id",
  asyncHandler(verifyUser),
  asyncHandler(getSingleOrderController)
);

/**
 * @method put
 * @route : ~/api/order/updateorder/:id
 * @desc  : update order status
 * @access : admin
 */
OrderRouter.put(
  "/updateorder/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(updateOrderStatusController)
);

/**
 * @method delete
 * @endpoint ~/api/order/delete/:id
 * @description delete order while status is pending
 * @access user
 */
OrderRouter.delete(
  "/delete/:id",
  asyncHandler(verifyUser),
  asyncHandler(deleteOrderController)
);

/**
 * @method delete
 * @endpoint ~/api/order/deleteadmin/:id
 * @description delete order by admin
 * @access admin
 */
OrderRouter.delete(
  "/deleteadmin/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteOrderByAdminController)
);

/**
 * @method get
 * @endpoint ~/api/order/status/:status
 * @description get order with status filter
 * @access admin
 */
OrderRouter.get(
  "/status/:status",
  asyncHandler(verifyAdmin),
  asyncHandler(getOrderByStatusController)
);

/**
 * @method get
 * @endpoint ~/api/order/done/:date
 * @description Filter done orders for a specific month and year
 * @access admin
 */
OrderRouter.get(
  "/done/:date",
  asyncHandler(verifyAdmin),
  asyncHandler(getDoneOrdersByDateController)
);

/**
 * @method get
 * @endpoint ~/api/order/topusers/orders
 * @description Get Top Users Based on Orders
 * @access admin
 */
OrderRouter.get(
  "/topusers/orders",
  asyncHandler(verifyAdmin),
  asyncHandler(getTopUsersBasedOnOrdersController)
);

/**
 * @method get
 * @endpoint ~/api/order/topusers/paymenttotal
 * @description Get Top Users Based on paymentTotal
 * @access admin
 */
OrderRouter.get(
  "/topusers/paymenttotal",
  asyncHandler(verifyAdmin),
  asyncHandler(getTopUsersBasedOnPaymentTotalController)
);

module.exports = OrderRouter;
