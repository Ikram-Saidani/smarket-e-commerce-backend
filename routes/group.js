const {
  createGroupController,
  updateAmbassadorController,
  deleteAndReplaceCoordinatorController,
  getTotalSalesController,
  deleteAmbassadorController,
  getAllGroupsController,
} = require("../controllers/group");
const GroupRouter = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const verifyAdmin = require("../utils/verifyAdmin");


/**
 * @method post
 * @route : ~/api/group/create
 * @desc  : Add Coordinator and Ambassadors to a Group
 * @access : admin
 */
GroupRouter.post(
  "/create",
  asyncHandler(verifyAdmin),
  asyncHandler(createGroupController)
);

/**
 * @method put
 * @route : ~/api/group/:groupId/updateambassador
 * @desc  : change Ambassador from Group to Another Group
 * @access : admin
 */
GroupRouter.put(
  "/:groupId/updateambassador",
  asyncHandler(verifyAdmin),
  asyncHandler(updateAmbassadorController)
);

/**
 * @method delete
 * @route : ~/api/group/:groupId/deletecoordinator
 * @desc  : Delete Coordinator and Replace him with another one
 * @access : admin
 */
GroupRouter.delete(
  "/:groupId/deletecoordinator",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteAndReplaceCoordinatorController)
);

/**
 * @method delete
 * @route : ~/api/group/:groupId/deleteambassador
 * @desc  : Delete Ambassador from Group
 * @access : admin
 */
GroupRouter.delete(
  "/:groupId/deleteambassador",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteAmbassadorController)
);

/**
 * @method get
 * @route : ~/api/group/totalsales/:month
 * @desc  : Get Total Sales for Group in a Month
 * @access : admin
 */
GroupRouter.get(
  "/totalsales/:month",
  asyncHandler(verifyAdmin),
  asyncHandler(getTotalSalesController)
);

/**
 * @method get
 * @route : ~/api/group
 * @desc  : Get all groups
 * @access : admin
 */
GroupRouter.get(
  "/",
  asyncHandler(verifyAdmin),
  asyncHandler(getAllGroupsController)
);

module.exports = GroupRouter;
