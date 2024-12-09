const ProductModel = require("../models/product");
const { CustomSuccess, CustomFail } = require("../utils/customResponses");
const catchDbErrors = require("../utils/catchDbErros");
const { validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary");

/**
 * @method get
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
 * @method get
 * @route : ~/api/product/search?title=product
 * @desc  : Get products with title search
 * @access : visitor
 */
async function getProductsWithTitleSearchController(req, res) {
  const { title } = req.query;

  if (!title || title.trim().length === 0) {
    throw new CustomFail("Title query parameter is required.");
  }

  const products = await catchDbErrors(
    ProductModel.find({
      title: { $regex: title, $options: "i" },
    })
  );

  if (products.length === 0) {
    throw new CustomFail("No products found matching the search term.");
  }

  res.json(
    new CustomSuccess({
      message: "Products found successfully.",
      products,
    })
  );
}

/**
 * @method get
 * @route : ~/api/product/pagination?page=page&limit=limit
 * @desc  : get all products with pagination queries
 * @access : visitor
 */
async function getAllProductsPaginationController(req, res) {
  const {
    page,
    limit,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const skip = (page - 1) * limit;
  const sortOrder = order === "desc" ? -1 : 1;
  const products = await catchDbErrors(
    ProductModel.find({
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
      "rate.rating": { $gte: Number(minRating) },
    })
      .skip(skip)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder })
  );

  const totalCount = await catchDbErrors(
    ProductModel.countDocuments({
      price: { $gte: minPrice, $lte: maxPrice },
      "rate.rating": { $gte: minRating },
    })
  );
  if (!products.length) {
    throw new CustomFail("No products found");
  }
  const min = await catchDbErrors(ProductModel.findOne().sort({ price: 1 }));
  const max = await catchDbErrors(ProductModel.findOne().sort({ price: -1 }));
  res.json(
    new CustomSuccess({
      data: products,
      totalCount,
      minimunPrice: min.price,
      maximunPrice: max.price,
    })
  );
}

/**
 * @method get
 * @route : ~/api/product/category?category=category&minPrice=0&maxPrice=1000&minRating=0
 * @desc  : get products by category
 * @access : visitor
 */
async function getProductsByCategoryController(req, res) {
  const {
    category,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;
  const sortOrder = order === "desc" ? -1 : 1;

  const products = await catchDbErrors(
    ProductModel.find({
      category,
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
      "rate.rating": { $gte: Number(minRating) },
    }).sort({ [sortBy]: sortOrder })
  );
  const totalCount = await catchDbErrors(
    ProductModel.countDocuments({
      category,
      price: { $gte: minPrice, $lte: maxPrice },
      "rate.rating": { $gte: minRating },
    })
  );
  if (!products.length) {
    throw new CustomFail("No products found", 404);
  }
  const min = await catchDbErrors(
    ProductModel.findOne({ category }).sort({ price: 1 })
  );
  const max = await catchDbErrors(
    ProductModel.findOne({ category }).sort({ price: -1 })
  );
  res.json(
    new CustomSuccess({
      data: products,
      totalCount,
      minimunPrice: min.price,
      maximunPrice: max.price,
    })
  );
}

/**
 * @method get
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
 * @method get
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
 * @method get
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
 * @method get
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
 * @method post
 * @route : ~/api/product
 * @desc  : add a new product
 * @access : admin
 */
async function postNewProductController(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new CustomFail("Validation Error: Please check your inputs");
  }
  const {
    category,
    oldPrice,
    discount,
    size,
    shoeSize,
    specifications,
    ingredients,
    expiryDate,
  } = req.body;
  if (!req.file) {
    throw new CustomFail("Image is required for creating a product.");
  }

  let cloudinaryImageUrl;
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
    cloudinaryImageUrl = cloudinaryResponse.secure_url;
  } catch (error) {
    console.error("Error during Cloudinary upload:", error); // Log the full error
    throw new CustomFail("Cloudinary upload failed.");
  }

  switch (category) {
    case "fashion":
      if (typeof size === "string") {
        req.body.size = JSON.parse(size);
      }
      req.body.countInStock = req.body.size.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
      break;
    case "footwear":
      if (typeof shoeSize === "string") {
        req.body.shoeSize = JSON.parse(shoeSize);
      }
      req.body.countInStock = req.body.shoeSize.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
      break;
    case "electronics":
      if (!specifications || typeof specifications !== "object") {
        req.body.specifications = JSON.parse(specifications);
        let specs = req.body.specifications.split(",");
        let specKeys = [];
        let specValues = [];
        specs.forEach((spec) => {
          let [key, value] = spec.split(":");
          specKeys.push(key);
          specValues.push(value);
        });
        req.body.specifications = specKeys.reduce((obj, key, index) => {
          obj[key] = specValues[index];
          return obj;
        }, {});
      }
      break;
    case "beauty":
      if (!ingredients || !Array.isArray(ingredients)) {
        let ing = ingredients.split(",");
        req.body.ingredients = ing;
      }
      break;
    case "groceries":
      if (!expiryDate || isNaN(new Date(expiryDate).getTime())) {
        throw new CustomFail("Groceries require a valid expiry date.");
      }
      break;
    case "bags":
      break;
    case "jewellery":
      break;
    default:
      throw new CustomFail("Invalid product category provided.");
  }
  //calculate price with old price and discount
  if (oldPrice && discount) {
    req.body.price = parseFloat(
      (+oldPrice - (+oldPrice * +discount) / 100).toFixed(2)
    );
  } else {
    req.body.price = +oldPrice;
  }
  //calculate coins with price
  if (req.body.price) {
    req.body.coins = Math.floor((req.body.price * 3) / 2);
  }

  const newProduct = await catchDbErrors(
    ProductModel.create({
      ...req.body,
      image: cloudinaryImageUrl,
    })
  );

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
}

/**
 * @method put
 * @route : ~/api/product/update/:id
 * @desc  : update an existing product
 * @access : admin
 */
async function updateProductController(req, res) {
  const {
    category,
    size,
    specifications,
    expiryDate,
    ingredients,
    oldPrice,
    discount,
    shoeSize,
  } = req.body;

  const product = await catchDbErrors(ProductModel.findById(req.params.id));
  if (!product) {
    throw new CustomFail("Product not found");
  }

  switch (category) {
    case "fashion":
      if (!Array.isArray(size)) {
        throw new CustomFail("Fashion products require a valid size array.");
      }
      req.body.countInStock = size.reduce(
        (total, item) => total + (+item.quantity || 0),
        0
      );
      break;

    case "footwear":
      if (!Array.isArray(shoeSize)) {
        throw new CustomFail(
          "Footwear products require a valid shoeSize array."
        );
      }
      req.body.countInStock = shoeSize.reduce(
        (total, item) => total + (+item.quantity || 0),
        0
      );
      break;

    case "electronics":
      if (!specifications || typeof specifications !== "object") {
        throw new CustomFail(
          "Electronics require specifications as a key-value map."
        );
      }
      break;

    case "beauty":
      if (!ingredients || !Array.isArray(ingredients)) {
        throw new CustomFail(
          "Beauty products require a valid ingredients array."
        );
      }
      break;

    case "groceries":
      if (!expiryDate || isNaN(new Date(expiryDate).getTime())) {
        throw new CustomFail("Groceries require a valid expiry date.");
      }
      break;
    default:
      throw new CustomFail("Invalid product category provided.");
  }

  // Calculate price with old price and discount
  if (oldPrice && discount) {
    req.body.price = parseFloat(
      (oldPrice - (oldPrice * discount) / 100).toFixed(2)
    );
  } else {
    req.body.price = oldPrice;
  }

  // Calculate coins with price
  if (req.body.price) {
    req.body.coins = Math.floor((req.body.price * 3) / 2);
  }

  // Update the product
  const updatedProduct = await catchDbErrors(
    ProductModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    )
  );

  if (!updatedProduct) {
    throw new CustomFail("Failed to update product.");
  }
  res.json(new CustomSuccess(updatedProduct));
}

/**
 * @method delete
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

/**
 * @method get
 * @route : ~/api/product/allproducts/countinstock
 * @desc  : get all products with countInStock < 10
 * @access : admin
 */
async function getProductsCountInStockController(req, res) {
  const products = await catchDbErrors(
    ProductModel.find({ countInStock: { $lt: 10 } })
  );
  if (!products || products.length === 0) {
    throw new CustomFail("No products found with countInStock < 10");
  }
  res.json(new CustomSuccess(products));
}

module.exports = {
  getAllProductsController,
  getProductsWithTitleSearchController,
  getAllProductsPaginationController,
  getProductsByCategoryController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getSingleProductController,
  postNewProductController,
  updateProductController,
  deleteProductController,
  getProductsCountInStockController,
};
