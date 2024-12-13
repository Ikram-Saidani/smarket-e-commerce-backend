const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "user" },
    orderedProducts: [
      {
        productId: { type: Types.ObjectId, ref: "product" },
        selectedSize: { type: String, default: "N/A" },
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
        _id: 0,
      },
    ],
    address: { type: String, required: true },
    paymentMode: {
      type: String,
      enum: ["onDelivery", "withCard","withCoins"],
      required: true,
    },
    discountApplied: { type: Number },
    paymentTotal: { type: Number },
    status: {
      type: String,
      enum: ["pending", "done", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);
orderSchema.index({ userId: 1 });

const OrderModel = model("order", orderSchema);

module.exports = OrderModel;
