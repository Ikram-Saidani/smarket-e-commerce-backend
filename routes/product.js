const asyncHandler = require("../utils/asyncHandler");
const ProductRouter = require("express").Router();
const {
  getProductsByCategoryPaginationController,
  getAllProductsPaginationController,
  getProductsByCategoryController,
  getAllProductsController,
  getFeaturedProductsController,
  getNewProductsController,
  getPopularProductsController,
  getSingleProductController,
  getPopularProductsByCategoryController,
} = require("../controllers/product");


/**
 * const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

      cb(null, 'products')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+"."+file.originalname.split('.')[1])
    },
  })


  const  fileFilter= function(req, file, cb) {

    if (!file.mimetype.includes('image') ) {
      return cb(new Error('I don\'t have a clue!'), false );
    }
    cb(null, true);
  }
const upload = multer({ storage: storage,fileFilter:fileFilter})

 */




/**
 * @method : get
 * @route : ~/api/product/
 * @desc  : get all products
 * @access : visitor
 */
ProductRouter.get("/", asyncHandler(getAllProductsController));

/**
 * @method : get
 * @route : ~/api/product/pagination?page=1&limit=10
 * @desc  : get all products with pagination queries
 * @access : visitor
 */
ProductRouter.get(
  "/pagination",
  asyncHandler(getAllProductsPaginationController)
);

/**
 * @method : get
 * @route : ~/api/product/category/:category
 * @desc  : get products by category
 * @access : visitor
 */
ProductRouter.get(
  "/category/:category",
  asyncHandler(getProductsByCategoryController)
);

/**
 * @method : get
 * @route : ~/api/product/category/:category/pagination?page=1&limit=10
 * @desc  : get products by category with pagination queries
 * @access : visitor
 */
ProductRouter.get(
  "/category/:category/pagination",
  asyncHandler(getProductsByCategoryPaginationController)
);

/**
 * @method : get
 * @route : ~/api/product/featured
 * @desc  : get 6 featured products
 * @access : visitor
 */
ProductRouter.get("/featured", asyncHandler(getFeaturedProductsController));

/**
 * @method : get
 * @route : ~/api/product/newproducts
 * @desc  : get 6 new products
 * @access : visitor
 */
ProductRouter.get("/newproducts", asyncHandler(getNewProductsController));

/**
 * @method : get
 * @route : ~/api/product/popular
 * @desc  : get 6 popular products
 * @access : visitor
 */
ProductRouter.get("/popular", asyncHandler(getPopularProductsController));

/**
 * @method : get
 * @route : ~/api/product/category/:category/popular
 * @desc  : get 6 popular products by category
 * @access : visitor
 */
ProductRouter.get(
  "/category/:category/popular",
  asyncHandler(getPopularProductsByCategoryController)
);

/**
 * @method : get
 * @route : ~/api/product/:id
 * @desc  : get single product with id
 * @access : visitor
 */
ProductRouter.get("/:id", asyncHandler(getSingleProductController));



/**
 * @method : post
 * @route : ~/api/product/
 * @desc  : post a new product
 * @access : admin
 */
//   ProductRouter.post('/',asyncHandler(verifyAdmin),upload.single("image"),asyncHandler(postNewProductController))

/**
 * @method : put
 * @route : ~/api/product/update/:id
 * @desc  : update  exist product
 * @access : admin
 */
// ProductRouter.put('/update/:id',asyncHandler(verifyAdmin),asyncHandler(updateProductController))

/**
 * @method : delete
 * @route : ~/api/product/delete/:id
 * @desc  : delete a product
 * @access : admin
 */
// ProductRouter.delete('/delete/:id',asyncHandler(verifyAdmin),asyncHandler(deleteProductController))

module.exports = ProductRouter;
