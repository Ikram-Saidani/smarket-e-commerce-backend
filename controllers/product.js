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

  // Check if the title parameter exists
  if (!title || title.trim().length === 0) {
    throw new CustomFail("Title query parameter is required.");
  }

  const products = await catchDbErrors(
    ProductModel.find({
      title: { $regex: title, $options: "i" },
    },{_id:0})
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
 * @method get
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
 * @method get
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
  //if no validation errors
  if (!result.isEmpty()) {
    throw new CustomFail("Validation Error: Please check your inputs");
  }

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

  // Ensure image is uploaded
  if (!req.file) {
    throw new CustomFail("Image is required for creating a product.");
  }
  // Upload image to Cloudinary
  let cloudinaryImageUrl;
  try {
    const uploadedImage = cloudinary.uploader
      .upload_stream(
        {
          folder: "products",
        },
        (err, result) => {
          if (err) {
            throw new CustomFail("Failed to upload image to Cloudinary.");
          }
          return result.secure_url;
        }
      )
      .end(req.file.buffer); // Pass the image buffer from Multer
    cloudinaryImageUrl = uploadedImage.secure_url;
  } catch (error) {
    throw new CustomFail("Cloudinary upload failed.");
  }

  switch (category) {
    case "fashion":
      if (!Array.isArray(size)) {
        throw new CustomFail("Fashion products require a valid size array.");
      }
      req.body.countInStock = size.reduce(
        (total, item) => total + item.quantity,
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
        (total, item) => total + item.quantity,
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
  //calculate price with old price and discount
  if (oldPrice && discount) {
    req.body.price = parseFloat(
      (oldPrice - (oldPrice * discount) / 100).toFixed(2)
    );
  } else {
    req.body.price = oldPrice;
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
  console.log(req.body);

  const {
    discount,
    oldPrice,
    size,
    shoeSize,
    ingredients,
    expiryDate,
    specifications,
    image,
  } = req.body;

  const product = await catchDbErrors(ProductModel.findById(req.params.id));
  if (!product) {
    throw new CustomFail("Product not found");
  }

  // Update price and coins
  if (oldPrice || discount) {
    const updatedOldPrice = oldPrice || product.oldPrice;
    const updatedDiscount = discount || product.discount;
    product.price = parseFloat(
      (updatedOldPrice - (updatedOldPrice * updatedDiscount) / 100).toFixed(2)
    );
    product.coins = Math.floor((product.price * 3) / 2);
  }

  // Handle size array (for "fashion")
  if (size && Array.isArray(size)) {
    size.forEach((newSize) => {
      const existingSize = product.size.find((s) => s.name === newSize.name);
      if (existingSize) {
        existingSize.quantity = newSize.quantity; // Update quantity if size exists
      } else {
        product.size.push(newSize); // Add new size if it doesn't exist
      }
    });
  }

  // Handle shoeSize array (for "footwear")
  if (shoeSize && Array.isArray(shoeSize)) {
    shoeSize.forEach((newShoeSize) => {
      const existingShoeSize = product.shoeSize.find(
        (s) => s.name === newShoeSize.name
      );
      if (existingShoeSize) {
        existingShoeSize.quantity = newShoeSize.quantity; // Update quantity
      } else {
        product.shoeSize.push(newShoeSize); // Add new shoeSize
      }
    });
  }

  // Handle ingredients array (for "beauty")
  if (ingredients && Array.isArray(ingredients)) {
    ingredients.forEach((newIngredient) => {
      if (!product.ingredients.includes(newIngredient)) {
        product.ingredients.push(newIngredient); // Add new ingredient if not exists
      }
    });
  }

  // Update expiryDate (for "groceries")
  if (expiryDate) {
    product.expiryDate = expiryDate;
  }

  // Update specifications (for "electronics")
  if (specifications && typeof specifications === "object") {
    product.specifications = specifications;
  }

  // Handle image update with Cloudinary
  if (image) {
    if (product.image) {
      // Optional: Delete the old image from Cloudinary
      const oldImagePublicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(oldImagePublicId);
    }
    // Upload the new image
    const cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
    product.image = cloudinaryResponse.secure_url; // Save the new image URL
  }

  // Save updated product
  const updatedProd = await catchDbErrors(product.save());

  res.json(new CustomSuccess(updatedProd));
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
  getProductsByCategoryPaginationController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getSingleProductController,
  postNewProductController,
  updateProductController,
  deleteProductController,
  getProductsCountInStockController,
};
