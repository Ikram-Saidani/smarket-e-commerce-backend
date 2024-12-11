const NotificationModel = require("../models/notification");
const OrderModel = require("../models/order");
const RoleRequestModel = require("../models/roleRequest");
const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");

/**
 * @method get
 * @route : ~/api/roleRequest
 * @desc  : get all role requests
 * @access : admin
 */
async function getAllRoleRequestsController(req, res) {
  const roleRequests = await RoleRequestModel.find().populate("userId");
  res.json(new CustomSuccess(roleRequests));
}

/**
 * @method get
 * @route : ~/api/roleRequest/:status
 * @desc  : get role requests with status filter
 * @access : admin
 */
async function getRoleRequestsByStatusController(req, res) {
  const { status } = req.params;
  const roleRequests = await catchDbErrors(
    RoleRequestModel.find({ status }).populate("userId")
  );
  res.json(new CustomSuccess(roleRequests));
}

/**
 * @method post
 * @route : ~/api/roleRequest/ambassadorOrCoordinator
 * @desc  : allows users or ambassadors to request a role change (to ambassador or coordinator)
 * @access : user
 */
async function wishToBeAmbassadorOrCoordinatorController(req, res) {
  const { message } = req.body;
  const { _id: userId, role: currentRole } = req.user;

  if (currentRole !== "user" && currentRole !== "ambassador") {
    return res.json(new CustomFail("You are not allowed to send this request"));
  }

  const existingRequest = await catchDbErrors(
    RoleRequestModel.findOne({ userId, status: "pending" })
  );

  if (existingRequest) {
    return res.json(new CustomFail("You already have a pending request"));
  }

  if (message === `I want to be ${currentRole} for Smarket`) {
    return res.json(
      new CustomFail(`You are already in the role of ${currentRole}`)
    );
  }
  if (currentRole === "ambassador") {
    const ambassadorOrders = await catchDbErrors(
      OrderModel.find({ userId, status: "done" })
    );
    const total = ambassadorOrders.reduce(
      (acc, order) => acc + order.paymentTotal,
      0
    );
    if (total < 5000) {
      return res.json(
        new CustomFail(
          "You must have a total order greater than 5000 $ to be a coordinator"
        )
      );
    }
  }

  const newRequest = new RoleRequestModel({
    userId,
    message,
  });

  await catchDbErrors(newRequest.save());

  res.json(new CustomSuccess("Your request has been submitted successfully"));
}

/**
 * @method put
 * @route : ~/api/roleRequest/:id
 * @desc  : update status by admin, change the role of user if the status is approved and send notification to user that their request has been approved or rejected
 * @access : admin
 */
async function updateRoleRequestStatusController(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const roleRequest = await catchDbErrors(RoleRequestModel.findById(id));
  if (!roleRequest) {
    return res.json(new CustomFail("Role request not found"));
  }

  if (status === "approved") {
    const user = await catchDbErrors(UserModel.findById(roleRequest.userId));
    user.role = roleRequest.message.includes("ambassador")
      ? "ambassador"
      : "coordinator";
    await user.save();
  }

  if (status === "approved" && roleRequest.message.includes("coordinator")) {
    await catchDbErrors(
      UserModel.updateOne(
        { _id: roleRequest.userId },
        { $set: { groupId: null } }
      )
    );
  }

  roleRequest.status = status;
  await roleRequest.save();
  const message =
    status === "approved"
      ? "Your request has been approved"
      : "Your request has been rejected";
  const notification = new NotificationModel({
    userId: roleRequest.userId,
    message,
  });
  await notification.save();

  res.json(new CustomSuccess("Role request status updated successfully"));
}

/**
 * @method delete
 * @route : ~/api/roleRequest/delete/:id
 * @desc  : delete role requests if status is rejected or approved
 * @access : admin
 */
async function deleteRoleRequestController(req, res) {
  const { id } = req.params;
  const roleRequest = await catchDbErrors(RoleRequestModel.findById(id));
  if (!roleRequest) {
    return res.json(new CustomFail("Role request not found"));
  }

  if (roleRequest.status === "pending") {
    return res.json(new CustomFail("Cannot delete pending request"));
  }

  await catchDbErrors(RoleRequestModel.findByIdAndDelete(id));
  res.json(new CustomSuccess("Role request deleted successfully"));
}

module.exports = {
  wishToBeAmbassadorOrCoordinatorController,
  getAllRoleRequestsController,
  updateRoleRequestStatusController,
  getRoleRequestsByStatusController,
  deleteRoleRequestController,
};
