const { Schema, model, Types } = require("mongoose");

const donationHistorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "user", required: true },
    productDonated: {
      type: Types.ObjectId,
      ref: "helpandhope",
      required: true,
    },
    status: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);
donationHistorySchema.index({ userId: 1 });
const DonationHistoryModel = model("donationHistory", donationHistorySchema);
module.exports = DonationHistoryModel;
