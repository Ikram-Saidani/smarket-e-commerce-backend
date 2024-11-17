const {model,Schema} = require("mongoose");

const commentSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    }
  },
  { timestamps: true , versionKey: false}

);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
