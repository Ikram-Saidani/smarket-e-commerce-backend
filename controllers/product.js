const ProductModel = require("../models/product");
const {
  customError,
  customFail,
  customSuccess,
} = require("../utils/customResponses");
const catchDbErrors = require("../utils/catchDbErros");

/**
 * @method : get
 * @route : ~/api/product/
 * @desc  : Get all products (with optional pagination and sorting)
 * @access : visitor
 */
async function getAllProductsController(req, res) {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    // Pagination setup
    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    // Fetch products with pagination and sorting
    const products = await ProductModel.find()
      .skip(skip)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder });

    if (!products.length) {
      throw new customFail("No products found");
    }

    // Send success response
    res.json(new customSuccess(products));
  } catch (error) {
    // Catch any potential errors
    next(error);
  }
}


/**
 * @method : get
 * @route : ~/api/product/category/:category
 * @desc  : get products by category with pagination
 * @access : visitor
 */
async function getProductsByCategoryController(req, res) {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query; // pagination parameters

  try {
    const products = await ProductModel.find({ category }) // filter by category
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProducts = await ProductModel.countDocuments({ category });

    if (!products.length) {
      throw new customFail("No products found in this category");
    }

    res.json({
      data: products,
      totalCount: totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  getAllProductsController,
  getProductsByCategoryController
};
