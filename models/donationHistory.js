const { Schema, model, Types } = require("mongoose");

const donationHistorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "user", required: true },
    orderDonation: [
      {
        productDonated: {
          type: Types.ObjectId,
          ref: "helpandhope",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        totalCoins: { type: Number, required: true },
        _id: 0,
      },
    ],
    coinsDonated: { type: Number },
  },
  { timestamps: true, versionKey: false }
);
donationHistorySchema.index({ userId: 1 });
const DonationHistoryModel = model("donationHistory", donationHistorySchema);
module.exports = DonationHistoryModel;
