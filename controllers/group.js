const GroupModel = require("../models/group");
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
  const adminId = req.user._id;

  if (!coordinatorId) {
    throw new CustomFail("Coordinator is required.");
  }

  const group = await catchDbErrors(
    GroupModel.create({
      admin: adminId,
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
 * @route : ~/api/group/:groupId/updateambassador
 * @desc  : change Ambassador from Group to Another Group
 * @access : admin
 */
async function updateAmbassadorController(req, res) {
  const { groupId } = req.params;
  const { ambassadorId, targetGroupId } = req.body;

  const [sourceGroup, targetGroup] = await Promise.all([
    catchDbErrors(GroupModel.findById(groupId)),
    catchDbErrors(GroupModel.findById(targetGroupId)),
  ]);

  if (!sourceGroup) throw new CustomFail("Source group not found.");
  if (!targetGroup) throw new CustomFail("Target group not found.");

  const ambassadorIndex = sourceGroup.ambassadors.indexOf(ambassadorId);
  if (ambassadorIndex === -1) {
    throw new CustomFail("Ambassador not found in the source group.");
  }

  sourceGroup.ambassadors.splice(ambassadorIndex, 1);
  targetGroup.ambassadors.push(ambassadorId);

  await Promise.all([sourceGroup.save(), targetGroup.save()]);

  await catchDbErrors(
    UserModel.findByIdAndUpdate(ambassadorId, { groupId: targetGroupId })
  );

  res.json(
    new CustomSuccess("Ambassador successfully moved to the target group.")
  );
}

/**
 * @method delete
 * @route : ~/api/group/:groupId/deletecoordinator
 * @desc  : Delete Coordinator and Replace them with another one
 * @access : admin
 */
async function deleteAndReplaceCoordinatorController(req, res) {
  const { groupId } = req.params;
  const { newCoordinatorId } = req.body;

  const group = await catchDbErrors(GroupModel.findById(groupId));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  const oldCoordinatorId = group.coordinator;
  if (!oldCoordinatorId) {
    throw new CustomFail("No coordinator assigned to this group.");
  }

  group.coordinator = newCoordinatorId;
  await catchDbErrors(group.save());

  await Promise.all([
    UserModel.findByIdAndUpdate(oldCoordinatorId, { groupId: null }),
    UserModel.findByIdAndUpdate(newCoordinatorId, { groupId }),
  ]);

  res.json(new CustomSuccess("Coordinator successfully replaced."));
}

/**
 * @method delete
 * @route : ~/api/group/:groupId/deleteambassador
 * @desc  : Delete Ambassador from Group
 * @access : admin
 */
async function deleteAmbassadorController(req, res) {
  const { groupId } = req.params;
  const { ambassadorId } = req.body;

  const group = await catchDbErrors(GroupModel.findById(groupId));
  if (!group) {
    throw new CustomFail("Group not found.");
  }

  const ambassadorIndex = group.ambassadors.indexOf(ambassadorId);
  if (ambassadorIndex === -1) {
    throw new CustomFail("Ambassador not found in this group.");
  }

  group.ambassadors.splice(ambassadorIndex, 1);
  await catchDbErrors(group.save());

  await catchDbErrors(
    UserModel.findByIdAndUpdate(ambassadorId, { groupId: null })
  );

  res.json(
    new CustomSuccess("Ambassador successfully removed from the group.")
  );
}

/**
 * @method get
 * @route : ~/api/group/totalsales/:date
 * @desc  : Get Total Sales for Group in a Month and Notify Top Group
 * @access : admin
 */
async function getTotalSalesController(req, res) {
  const { date } = req.params;

  const [year, month] = date.split("-");
  const startOfMonth = new Date(`${year}-${month}-01T00:00:00Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);

  const groups = await catchDbErrors(GroupModel.find({}))
    .populate("coordinator ambassadors")
    .exec();

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
      groupName: group.name,
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
  if (topGroup.coordinator) {
    notifications.push(
      notifyUser(
        topGroup.coordinator,
        "Congratulations!",
        `Your group (${topGroup.groupName}) achieved the highest total sales for ${date}. You've won a free marketing formation at Gomycode!`
      )
    );
  }

  for (const ambassador of topGroup.ambassadors) {
    if (ambassador) {
      ambassador.discountEarnedWithGroup += 500;
      await ambassador.save();

      notifications.push(
        notifyUser(
          ambassador,
          "Congratulations!",
          `Your group (${topGroup.groupName}) achieved the highest total sales for ${date}. You've earned 500 TND for your contributions!`
        )
      );
    }
  }

  await Promise.all(notifications);

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
    UserModel.find({ _id: { $in: [group.coordinator, ...group.ambassadors] } })
  );

  res.json(new CustomSuccess(groupMembers));
}

module.exports = {
  createGroupController,
  updateAmbassadorController,
  deleteAndReplaceCoordinatorController,
  getTotalSalesController,
  deleteAmbassadorController,
  getAllGroupsController,
  getGroupMembersController,
};
