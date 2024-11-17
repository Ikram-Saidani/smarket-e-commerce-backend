const donationSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
      productDonated: { type: Schema.Types.ObjectId, ref: "product", required: true },
      coins: { type: Number, min: [0, "Coins must be a positive number"], required: true },
      date: { type: Date, default: Date.now },
    },
    { timestamps: true, versionKey: false }
  );
  
  const DonationModel = model("donation", donationSchema);
  