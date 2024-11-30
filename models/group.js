const { Schema, model,Types } = require("mongoose");

const groupSchema = new Schema(
  {
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