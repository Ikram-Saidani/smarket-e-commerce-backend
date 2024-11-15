const { getAllOrdersController, getuserOrdersController, updateOrderStatusController, postNewOrderContoroller, getSingleOrder } = require('../controllers/order')
const asyncHandler = require('../utils/asyncHandler')
const OrderRouter=require('express').Router()
const verifyAdmin=require('../utils/verifyAdmin')
const verifyUser = require('../utils/verifyUser')

/**
 * @method : get
 * @route : ~/api/order/
 * @desc  : get all Orders
 * @access : admin
 */
OrderRouter.get('/',asyncHandler(verifyAdmin),asyncHandler(getAllOrdersController))
/**
 * @method : get
 * @route : ~/api/order/item/:id
 * @desc  : get all Orders
 * @access : admin
 */
OrderRouter.get('/item/:id',asyncHandler(verifyAdmin),asyncHandler(getSingleOrder))


/**
 * @method : get
 * @route : ~/api/order/userorders
 * @desc  : get user Orders
 * @access : user
 */
OrderRouter.get('/userorders',asyncHandler(verifyUser),asyncHandler(getuserOrdersController))

  /**
 * @method : put
 * @route : ~/api/order/updateorder/:id
 * @desc  : update order status 
 * @access : admin
 */
OrderRouter.put('/updateorder/:id',asyncHandler(verifyAdmin),asyncHandler(updateOrderStatusController))

    /**
 * @method : post
 * @route : ~/api/order/postorder
 * @desc  : post new order order  
 * @access : user
 */
OrderRouter.post('/postorder',asyncHandler(verifyUser),asyncHandler(postNewOrderContoroller))
module.exports=OrderRouter