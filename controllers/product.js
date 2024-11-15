const ProductModel = require("../models/product");
const { CustomSuccess, CustomFail } = require("../utils/customResponses");
const catchDbErrors = require("../utils/catchDbErros");
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
    ProductModel.find({ category }).sort({saleCount:-1}).limit(6)
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




// const { validationResult } = require("express-validator");

/**
 * @method : post
 * @route : ~/api/product/
 * @desc  : post a new product
 * @access : admin
 */
// async function postNewProductController(req, res) {
//   console.log(req.file);
//   const result = validationResult(req);
//   if (!result.isEmpty()) {
//     throw new customError(
//       "message from express validator, title must be longer the 3  words",
//       "fail",
//       400
//     );
//   }
//   var newProd;
//   try {
//     newProd = await ProductModel.create({
//       ...req.body,
//       image: "/" + req.file.filename,
//     });
//   } catch (error) {
//     throw new customError(error.message, "errorrrrr", 400);
//   }
//   res.json({ status: "success", data: newProd });
// }

/**
 * @method : put
 * @route : ~/api/product/update/:id
 * @desc  : update  exist product
 * @access : admin
 */
// async function updateProductController(req, res) {
//   console.log(req.body);

//   const updatedProd = await catchDbErrors(
//     ProductModel.findByIdAndUpdate(req.params.id, req.body, {
//       returnDocument: "after",
//     })
//   );
//   if (!updatedProd) {
//     throw new customFail("product not found");
//   }

//   res.json(new customSuccess(updatedProd));
// }

/**
 * @method : delete
 * @route : ~/api/product/delete/:id
 * @desc  : delete a product
 * @access : admin
 */
// async function deleteProductController(req, res) {
//   const deletedProduct = await catchDbErrors(
//     ProductModel.findByIdAndDelete(req.params.id)
//   );
//   if (!deletedProduct) {
//     throw new customFail("product not found");
//   }
//   res.json(new customSuccess(deletedProduct));
// }
module.exports = {
  getAllProductsController,
  getAllProductsPaginationController,
  getProductsByCategoryController,
  getProductsByCategoryPaginationController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getPopularProductsByCategoryController,getSingleProductController
};
