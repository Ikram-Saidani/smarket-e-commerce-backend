const {
  createGroupController,
  deleteMemberController,
  getTotalSalesController,
  getAllGroupsController,
  getGroupMembersController,
  deleteGroupController,
  replaceCoordinatorController,addAmbassadorController
} = require("../controllers/group");
const GroupRouter = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const verifyAdmin = require("../utils/verifyAdmin");
const verifyUser = require("../utils/verifyUser");

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
 * @route : ~/api/group/addAmbassador/:groupId
 * @desc  : Add Ambassador to Group
 * @access : admin
 */
GroupRouter.put(
  "/addambassador/:groupId",
  asyncHandler(verifyAdmin),
  asyncHandler(addAmbassadorController)
);

/**
 * @method delete
 * @route : ~/api/group/:groupId
 * @desc  : Delete member
 * @access : admin
 */
GroupRouter.delete(
  "/deletemember/:groupId",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteMemberController)
);

/**
 * @method put
 * @route : ~/api/group/replacecoordinator/:groupId
 * @desc  : replace coordinator
 * @access : admin
 */
GroupRouter.put(
  "/replacecoordinator/:groupId",
  asyncHandler(verifyAdmin),
  asyncHandler(replaceCoordinatorController)
);

/**
 * @method get
 * @route : ~/api/group/totalsales
 * @desc  : Get Total Sales for Group in a Month
 * @access : admin
 */
GroupRouter.get(
  "/totalsales",
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

/**
 * @method delete
 * @route : ~/api/group/:id
 * @desc  : Delete group
 * @access : admin
 */
GroupRouter.delete(
  "/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteGroupController)
);

/**
 * @method get
 * @route : ~/api/group/:id
 * @desc  : Get list of group members for one of the members
 * @access : user
 */
GroupRouter.get(
  "/:id",
  asyncHandler(verifyUser),
  asyncHandler(getGroupMembersController)
);

module.exports = GroupRouter;
