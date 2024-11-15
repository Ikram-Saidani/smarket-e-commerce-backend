const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');

async function assignSocketIdToUser(userId, socketId) {
  // Generate a unique socketId using UUID
  const uniqueSocketId = uuidv4();

  // Find user and assign the socketId
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Only update if the socketId is not already set
  if (!user.socketId) {
    user.socketId = uniqueSocketId;
    await user.save();
  }

  return user;
}

module.exports = { assignSocketIdToUser };
