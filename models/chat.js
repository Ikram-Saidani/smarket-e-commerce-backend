const chatSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "group", required: true },
    userId: { type: Types.ObjectId, ref: "user", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const ChatModel = model("chat", chatSchema);

  