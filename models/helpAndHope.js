const { Schema, model } = require("mongoose");

const HelpAndHopeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    coins: {
      type: Number,
      required: true,
      min: 0,
    },
    theme: {
      type: String,
      required: true,
      enum: ["medicine", "school", "wedding", "eid", "ramadan", "winter"],
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const HelpAndHopeModel = model("helpandhope", HelpAndHopeSchema);
module.exports = HelpAndHopeModel;
