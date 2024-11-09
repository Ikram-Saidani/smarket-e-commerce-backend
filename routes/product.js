const asyncHandler = require('../utils/asyncHandler')
const ProductRouter=require('express').Router()
const {getAllProductsController, getProductsByCategoryController}=require('../controllers/product')

/**
 * @method : get
 * @route : ~/api/product/
 * @desc  : get all products
 * @access : visitor
 */
ProductRouter.get('/',asyncHandler(getAllProductsController))
/**
 * @method : get
 * @route : ~/api/product/category/:category
 * @desc  : get products by category with pagination
 * @access : visitor
 */
ProductRouter.get('/category/:category',asyncHandler(getProductsByCategoryController))


module.exports=ProductRouter