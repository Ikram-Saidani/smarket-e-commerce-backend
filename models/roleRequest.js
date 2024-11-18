const { Schema, model, Types } = require("mongoose");

const roleRequestSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "user" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

const RoleRequestModel = new model("roleRequest", roleRequestSchema);

module.exports = RoleRequestModel;
