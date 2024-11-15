const { Schema, model, Types } = require('mongoose');

const validationSchema = new Schema(
  {
    hash: {
      type: String,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const validationModel = model("validation", validationSchema);

module.exports = validationModel;
