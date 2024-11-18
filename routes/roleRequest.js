const {
  wishToBeAmbassadorOrCoordinatorController,
  getAllRoleRequestsController,
  updateRoleRequestStatusController,
  getRoleRequestsByStatusController,
  deleteRoleRequestController,
} = require("../controllers/roleRequest");
const asyncHandler = require("../utils/asyncHandler");
const RoleRequestRouter = require("express").Router();
const verifyAdmin = require("../utils/verifyAdmin");
const verifyUser = require("../utils/verifyUser");

/**
 * @method get
 * @route : ~/api/roleRequest
 * @desc  : get all role requests
 * @access : admin
 */
RoleRequestRouter.get(
  "/",
  asyncHandler(verifyAdmin),
  asyncHandler(getAllRoleRequestsController)
);

/**
 * @method get
 * @route : ~/api/roleRequest/:status
 * @desc  : get role requests with status filter
 * @access : admin
 */
RoleRequestRouter.get(
  "/:status",
  asyncHandler(verifyAdmin),
  asyncHandler(getRoleRequestsByStatusController)
);

/**
 * @method post
 * @route : ~/api/roleRequest/ambassadorOrCoordinator
 * @desc  : allows users or ambassadors to request a role change (to ambassador or coordinator)
 * @access : user
 */
RoleRequestRouter.post(
  "/ambassadorOrCoordinator",
  asyncHandler(verifyUser),
  asyncHandler(wishToBeAmbassadorOrCoordinatorController)
);

/**
 * @method put
 * @route : ~/api/roleRequest/:id
 * @desc  : update status by admin, change the role of user if the status is approved and send notification to user that their request has been approved or rejected
 * @access : admin
 */
RoleRequestRouter.put(
  "/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(updateRoleRequestStatusController)
);

/**
 * @method delete
 * @route : ~/api/roleRequest/delete/:id
 * @desc  : delete role requests if status is rejected or approved
 * @access : admin
 */
RoleRequestRouter.delete(
  "/delete/:id",
  asyncHandler(verifyAdmin),
  asyncHandler(deleteRoleRequestController)
);

module.exports = RoleRequestRouter;
