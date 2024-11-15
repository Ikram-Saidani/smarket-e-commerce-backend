const ProductModel = require("../models/product");
const { CustomSuccess, CustomFail } = require("../utils/customResponses");
const catchDbErrors = require("../utils/catchDbErros");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

/**
 * @method : get
 * @route : ~/api/product/
 * @desc  : get all products
 * @access : visitor
 */
async function getAllProductsController(req, res) {
  const products = await catchDbErrors(ProductModel.find());
  if (!products.length) {
    throw new CustomFail("no products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/pagination?page=1&limit=10
 * @desc  : get all products with pagination queries
 * @access : visitor
 */
async function getAllProductsPaginationController(req, res) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const sortOrder = order === "desc" ? -1 : 1;

  const products = await catchDbErrors(
    ProductModel.find()
      .skip(skip)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder })
  );

  if (!products.length) {
    throw new CustomFail("No products found");
  }

  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/category/:category
 * @desc  : get products by category
 * @access : visitor
 */
async function getProductsByCategoryController(req, res) {
  const { category } = req.params;
  const products = await catchDbErrors(ProductModel.find({ category }));
  if (!products.length) {
    throw new CustomFail("No products found", 404);
  }
  res.json(new CustomSuccess(products));
}
/**
 * @method : get
 * @route : ~/api/product/category/:category/pagination?page=1&limit=10
 * @desc  : get products by category with pagination queries
 * @access : visitor
 */
async function getProductsByCategoryPaginationController(req, res) {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const products = await catchDbErrors(
    ProductModel.find({ category })
      .skip((page - 1) * limit)
      .limit(limit)
  );

  if (!products.length) {
    throw new CustomFail("No products found in this category");
  }

  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/featured
 * @desc  : get 6 featured products
 * @access : visitor
 */
async function getFeaturedProductsController(req, res) {
  const products = await catchDbErrors(
    ProductModel.find().sort({ "rate.rating": -1 }).limit(6)
  );
  if (!products.length) {
    throw new CustomFail("No featured products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/newproducts
 * @desc  : get 6 new products
 * @access : visitor
 */
async function getNewProductsController(req, res) {
  const products = await catchDbErrors(
    ProductModel.find().sort({ createdAt: -1 }).limit(6)
  );
  if (!products.length) {
    throw new CustomFail("No new products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/popular
 * @desc  : get 6 popular products
 * @access : visitor
 */
async function getPopularProductsController(req, res) {
  const products = await catchDbErrors(
    ProductModel.find().sort({ saleCount: -1 }).limit(6)
  );
  if (!products.length) {
    throw new CustomFail("No popular products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/category/:category/popular
 * @desc  : get 6 popular products by category
 * @access : visitor
 */
async function getPopularProductsByCategoryController(req, res) {
  const { category } = req.params;
  const products = await catchDbErrors(
    ProductModel.find({ category }).sort({ saleCount: -1 }).limit(6)
  );
  if (!products.length) {
    throw new CustomFail("No popular products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method : get
 * @route : ~/api/product/:id
 * @desc  : get single product with id
 * @access : visitor
 */
async function getSingleProductController(req, res) {
  const product = await catchDbErrors(ProductModel.findById(req.params.id));
  if (!product) {
    throw new CustomFail(" product not found");
  }
  res.json(new CustomSuccess(product));
}

/**
 * @method : post
 * @route : ~/api/product
 * @desc  : add a new product
 * @access : admin
 */
async function postNewProductController(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new CustomFail("Validation Error: Please check your inputs");
  }

  // Ensure the 'image' field is in the body
  const { image, category, size, specifications, expiryDate } = req.body;

  if (!image) {
    throw new CustomFail("Image is required for creating a product.");
  }

  let cloudinaryImageUrl = image; // Directly assign the image URL
  // Handle category-specific validations
  if (category === "fashion" && (!size || !Array.isArray(size))) {
    throw new CustomFail("Fashion products require a valid size array.");
  }
  if (
    category === "electronics" &&
    (!specifications || typeof specifications !== "object")
  ) {
    throw new CustomFail(
      "Electronics require specifications as a key-value map."
    );
  }
  if (
    category === "groceries" &&
    (!expiryDate || isNaN(new Date(expiryDate).getTime()))
  ) {
    throw new CustomFail("Groceries require a valid expiry date.");
  }

  let newProduct;

  // Create the product with the Cloudinary image URL
  newProduct = await catchDbErrors(
    ProductModel.create({
      ...req.body,
      image: cloudinaryImageUrl, // Store the Cloudinary image URL in the DB
    })
  );

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
}

/**
 * @method : put
 * @route : ~/api/product/update/:id
 * @desc  : update  exist product
 * @access : admin
 */
async function updateProductController(req, res) {
  console.log(req.body);

  const updatedProd = await catchDbErrors(
    ProductModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
  );
  if (!updatedProd) {
    throw new CustomFail("product not found");
  }

  res.json(new CustomSuccess(updatedProd));
}

/**
 * @method : delete
 * @route : ~/api/product/delete/:id
 * @desc  : delete a product
 * @access : admin
 */
async function deleteProductController(req, res) {
  const deletedProduct = await catchDbErrors(
    ProductModel.findByIdAndDelete(req.params.id)
  );
  if (!deletedProduct) {
    throw new CustomFail("product not found");
  }
  res.json(new CustomSuccess(deletedProduct));
}
module.exports = {
  getAllProductsController,
  getAllProductsPaginationController,
  getProductsByCategoryController,
  getProductsByCategoryPaginationController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getPopularProductsByCategoryController,
  getSingleProductController,
  postNewProductController,
  updateProductController,
  deleteProductController,
};
