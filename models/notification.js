const { model } = require("mongoose");
const { Schema } = require("mongoose");

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 1 day
const NotificationModel = model("notification", notificationSchema);
module.exports = NotificationModel;
