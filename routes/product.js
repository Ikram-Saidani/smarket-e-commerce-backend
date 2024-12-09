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
const verifyAdmin = require("../utils/verifyAdmin");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const productDir = `uploads/images`;
    fs.mkdirSync(productDir, { recursive: true });
    cb(null, productDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, `image-${uniqueSuffix}.${extension}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG and PNG images are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } });
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
  upload.single('image'),
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
