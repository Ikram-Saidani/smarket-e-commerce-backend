const { Schema, model,Types } = require("mongoose");

const groupSchema = new Schema(
  {
    admin: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    coordinator: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    ambassadors: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const GroupModel = model("group", groupSchema);

module.exports = GroupModel;