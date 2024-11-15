const groupSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    coordinator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ambassadors: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Group = model("group", groupSchema);
