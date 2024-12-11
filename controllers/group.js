const { Types } = require("mongoose");
const { default: mongoose } = require("mongoose");
const GroupModel = require("../models/group");
const NotificationModel = require("../models/notification");
const OrderModel = require("../models/order");
const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");

/**
 * @method post
 * @route : ~/api/group/create
 * @desc  : Add Coordinator and Ambassadors to a Group and update their groupId
 * @access : admin
 */
async function createGroupController(req, res) {
  const { coordinatorId, ambassadorsIds } = req.body;

  if (!coordinatorId) {
    throw new CustomFail("Coordinator is required.");
  }

  const group = await catchDbErrors(
    GroupModel.create({
      coordinator: coordinatorId,
      ambassadors: ambassadorsIds,
    })
  );

  await catchDbErrors(
    UserModel.updateOne(
      { _id: coordinatorId },
      { $set: { groupId: group._id } }
    )
  );

  if (ambassadorsIds && ambassadorsIds.length > 0) {
    await catchDbErrors(
      UserModel.updateMany(
        { _id: { $in: ambassadorsIds } },
        { $set: { groupId: group._id } }
      )
    );
  }

  res.json(new CustomSuccess(group));
}

/**
 * @method put
 * @route : ~/api/group/addAmbassador/:groupId
 * @desc  : Add Ambassador to Group
 * @access : admin
 */
async function addAmbassadorController(req, res) {
  const { groupId } = req.params;
  const { ambassador } = req.body;
 
  const ambassadorId = new Types.ObjectId(ambassador);
  const group = await catchDbErrors(GroupModel.findById(groupId));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  if (group.ambassadors.includes(ambassadorId)) {
    throw new CustomFail("Ambassador already in the group.");
  }

  await catchDbErrors(
    GroupModel.updateOne(
      { _id: groupId },
      { $push: { ambassadors: ambassadorId } }
    )
  );

  await catchDbErrors(
    UserModel.updateOne({ _id: ambassadorId }, { groupId: groupId })
  );

  res.json(new CustomSuccess("Ambassador successfully added to the group."));
}

/**
 * @method delete
 * @route : ~/api/group/:groupId
 * @desc  : Delete Ambassador from Group
 * @access : admin
 */
async function deleteMemberController(req, res) {
  const { groupId } = req.params;
  const { member } = req.body;
  const group = await catchDbErrors(GroupModel.findById({ _id: groupId }));
  const memberId = new Types.ObjectId(member);
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  if (group.coordinator === memberId) {
    throw new CustomFail("Coordinator cannot be deleted.");
  }

  const ambassadorIndex = group.ambassadors.indexOf(memberId);
  if (ambassadorIndex === -1) {
    throw new CustomFail("Member not found in this group.");
  }

  group.ambassadors.splice(ambassadorIndex, 1);
  await catchDbErrors(
    GroupModel.findByIdAndUpdate(
      { _id: groupId },
      { ambassadors: group.ambassadors }
    )
  );

  await catchDbErrors(
    UserModel.findByIdAndUpdate({ _id: memberId }, { groupId: null })
  );

  res.json(new CustomSuccess("Member successfully removed from the group."));
}

/**
 * @method put
 * @route : ~/api/group/replacecoordinator/:groupId
 * @desc  : replace coordinator
 * @access : admin
 */
async function replaceCoordinatorController(req, res) {
  const { groupId } = req.params;
  const { coordinatorId } = req.body;
  const coordinator = new Types.ObjectId(coordinatorId);
  const group = await catchDbErrors(GroupModel.findById(groupId));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  if (group.coordinator === coordinator) {
    throw new CustomFail("The new coordinator is already the coordinator.");
  }

  if (group.ambassadors.includes(coordinator)) {
    throw new CustomFail("The new coordinator is already an ambassador.");
  }

  await catchDbErrors(
    UserModel.updateOne({ _id: group.coordinator }, { groupId: null })
  );

  await catchDbErrors(
    UserModel.updateOne({ _id: coordinator }, { groupId: groupId })
  );

  await catchDbErrors(
    GroupModel.updateOne({ _id: groupId }, { coordinator: coordinator })
  );

  res.json(new CustomSuccess("Coordinator successfully replaced."));
}

/**
 * @method get
 * @route : ~/api/group/totalsales
 * @desc  : Get Total Sales for Group in a Month and Notify Top Group
 * @access : admin
 */
async function getTotalSalesController(req, res) {
  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const groups = await catchDbErrors(GroupModel.find());

  const coordinatorIds = groups.map((group) => group.coordinator);
  const ambassadorIds = [];
  groups.forEach((group) => ambassadorIds.push(...group.ambassadors));

  let totalSalesData = [];

  for (const group of groups) {
    let totalSales = 0;

    const groupMembers = [group.coordinator, ...group.ambassadors];

    const orders = await catchDbErrors(
      OrderModel.find({
        userId: { $in: groupMembers },
        paymentTotal: { $exists: true },
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      })
    );

    totalSales = orders.reduce((sum, order) => sum + order.paymentTotal, 0);

    totalSalesData.push({
      groupId: group._id,
      coordinator: group.coordinator,
      ambassadors: group.ambassadors,
      totalSales,
    });
  }

  totalSalesData.sort((a, b) => b.totalSales - a.totalSales);
  if (totalSalesData.length === 0) {
    throw new CustomFail("No sales data found for the given month.");
  }

  const topGroup = totalSalesData[0];
  const notifications = [];
  for (const group of groups) {
    if (group._id.toString() === topGroup.groupId.toString()) {
      notifications.push({
        userId: group.coordinator,
        message:
          "Congratulations! Your group is the top selling group this month.",
      });
      group.ambassadors.forEach((ambassadorId) => {
        notifications.push({
          userId: ambassadorId,
          message:
            "Congratulations! Your group is the top selling group this month.",
        });
      });
    }
  }
  const existNotifications = await catchDbErrors(
    NotificationModel.find({
      userId: { $in: coordinatorIds.concat(ambassadorIds) },
      message: notifications[0].message,
    })
  );
  const existNotificationsIds = existNotifications.map((notification) =>
    notification.userId.toString()
  );

  const newNotifications = notifications.filter(
    (notification) =>
      !existNotificationsIds.includes(notification.userId.toString())
  );

  await catchDbErrors(NotificationModel.insertMany(newNotifications));

  res.json(
    new CustomSuccess({
      totalSalesData,
      topGroup,
      reward: {
        coordinator: "Free marketing formation at Gomycode",
        ambassadors: "500 TND earned for contributions",
      },
    })
  );
}

/**
 * @method get
 * @route : ~/api/group
 * @desc  : Get all groups
 * @access : admin
 */
async function getAllGroupsController(req, res) {
  const groups = await catchDbErrors(GroupModel.find());
  if (!groups || groups.length === 0) {
    throw new CustomFail("No groups found.");
  }

  res.json(new CustomSuccess(groups));
}

/**
 * @method delete
 * @route : ~/api/group/:id
 * @desc  : Delete group
 * @access : admin
 */
async function deleteGroupController(req, res) {
  const { id } = req.params;
  const group = await catchDbErrors(GroupModel.findById(id));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  await catchDbErrors(UserModel.updateMany({ groupId: id }, { groupId: null }));
  await catchDbErrors(GroupModel.deleteOne({ _id: id }, { new: true }));

  res.json(new CustomSuccess("Group successfully deleted."));
}

/**
 * @method get
 * @route : ~/api/group/:id
 * @desc  : Get list of group members for one of the members
 * @access : user
 */
async function getGroupMembersController(req, res) {
  const { id } = req.params;
  const group = await catchDbErrors(GroupModel.findById(id));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  const groupMembers = await catchDbErrors(
    UserModel.find({
      _id: { $in: [group.coordinator, ...group.ambassadors] },
    }).select(-"password")
  );

  res.json(new CustomSuccess(groupMembers));
}

module.exports = {
  createGroupController,
  deleteMemberController,
  getTotalSalesController,
  getAllGroupsController,
  getGroupMembersController,
  deleteGroupController,
  replaceCoordinatorController,
  addAmbassadorController,
};
