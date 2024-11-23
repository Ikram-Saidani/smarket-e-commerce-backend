const HelpAndHopeRouter = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const {
  getAllHelpAndHopeProductsController,
  postNewHelpAndHopeProductController,
  updateHelpAndHopeProductController,
  deleteHelpAndHopeProductController,
} = require("../controllers/helpAndHope");
const verifyAdmin = require("../utils/verifyAdmin");

/**
 * @method get
 * @route : ~/api/helpAndHope
 * @desc  : get all Help And Hope Products
 * @access : visitor
 */
HelpAndHopeRouter.get("/", asyncHandler(getAllHelpAndHopeProductsController));

/**
 * @method post
 * @route : ~/api/helpAndHope/create
 * @desc  : add a new Help And Hope Product
 * @access : admin
 */
HelpAndHopeRouter.post(
  "/create",
  asyncHandler(verifyAdmin),
  asyncHandler(postNewHelpAndHopeProductController)
);

/**
 * @method put
 * @route /api/helpAndHope/update/:id
 * @desc  : update Help And Hope Product
 * @access : Admin
 */
HelpAndHopeRouter.put(
  "/update/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(updateHelpAndHopeProductController)
);

/**
 * @method delete
 * @route /api/helpAndHope/delete/:id
 * @desc  : delete Help And Hope Product
 * @access : Admin
 */
HelpAndHopeRouter.delete(
  "/delete/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteHelpAndHopeProductController)
);
module.exports = HelpAndHopeRouter;
