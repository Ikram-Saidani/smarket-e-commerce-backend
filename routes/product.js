const asyncHandler = require("../utils/asyncHandler");
const ProductRouter = require("express").Router();
const {
  getAllProductsPaginationController,
  getProductsByCategoryController,
  getAllProductsController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getSingleProductController,
  postNewProductController,
  updateProductController,
  deleteProductController,
  getProductsCountInStockController,
  getProductsWithTitleSearchController,
} = require("../controllers/product");
const multer = require("multer");
const verifyAdmin = require("../utils/verifyAdmin");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

/**
 * @method get
 * @route : ~/api/product/
 * @desc  : get all products
 * @access : visitor
 */
ProductRouter.get("/", asyncHandler(getAllProductsController));

/**
 * @method get
 * @route : ~/api/product/search?title=product
 * @desc  : get products with title search
 * @access : visitor
 */
ProductRouter.get("/search",
  asyncHandler(getProductsWithTitleSearchController)
);

/**
 * @method get
 * @route : ~/api/product/pagination?page=page&limit=limit
 * @desc  : get all products with pagination queries
 * @access : visitor
 */
ProductRouter.get(
  "/pagination",
  asyncHandler(getAllProductsPaginationController)
);

/**
 * @method get
 * @route : ~/api/product/category
 * @desc  : get products by category
 * @access : visitor
 */
ProductRouter.get(
  "/category",
  asyncHandler(getProductsByCategoryController)
);

/**
 * @method get
 * @route : ~/api/product/featured
 * @desc  : get 6 featured products
 * @access : visitor
 */
ProductRouter.get("/featured", asyncHandler(getFeaturedProductsController));

/**
 * @method get
 * @route : ~/api/product/newproducts
 * @desc  : get 6 new products
 * @access : visitor
 */
ProductRouter.get("/newproducts", asyncHandler(getNewProductsController));

/**
 * @method get
 * @route : ~/api/product/popular
 * @desc  : get 6 popular products
 * @access : visitor
 */
ProductRouter.get("/popular", asyncHandler(getPopularProductsController));

/**
 * @method get
 * @route : ~/api/product/:id
 * @desc  : get single product with id
 * @access : visitor
 */
ProductRouter.get("/:id", asyncHandler(getSingleProductController));

/**
 * @method post
 * @route : ~/api/product
 * @desc  : add a new product
 * @access : admin
 */
ProductRouter.post(
  "/",
  asyncHandler(verifyAdmin),
  upload,
  asyncHandler(postNewProductController)
);

/**
 * @method put
 * @route : ~/api/product/update/:id
 * @desc  : update an existing product
 * @access : admin
 */
ProductRouter.put(
  "/update/:id",
  asyncHandler(verifyAdmin),
  upload,
  asyncHandler(updateProductController)
);

/**
 * @method delete
 * @route : ~/api/product/delete/:id
 * @desc  : delete a product
 * @access : admin
 */
ProductRouter.delete(
  "/delete/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteProductController)
);

/**
 * @method get
 * @route : ~/api/product/allproducts/countinstock
 * @desc  : get all products with countInStock < 10
 * @access : admin
 */
ProductRouter.get(
  "/allproducts/countinstock",
  asyncHandler(verifyAdmin),
  asyncHandler(getProductsCountInStockController)
);

module.exports = ProductRouter;
