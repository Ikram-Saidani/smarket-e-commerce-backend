const socketSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
      socketId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
  );
  
  const SocketModel = model("Socket", socketSchema);
  