const CommentModel = require("../models/comment");
const ProductModel = require("../models/product");
const UserModel = require("../models/user");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");

/**
 * @method post
 * @endpoint  ~/api/comment/addcomment/:productId
 * @description post a comment for a product
 * @access user
 */
async function postNewCommentController(req, res) {
  const product = await catchDbErrors(
    ProductModel.findById(req.params.productId)
  );
  if (!product) {
    throw new CustomFail("Product not found");
  }
  const { comment, rating } = req.body;

  if (!comment || typeof rating !== "number") {
    return res.status(400).json({ message: "Comment and rating are required" });
  }
  const newComment = await catchDbErrors(
    CommentModel.create({
      userId: req.user._id,
      productId: req.params.productId,
      comment,
      rating,
    })
  );
  if (rating > 0) {
    const totalRating =
      product.rate.rating * product.rate.ratingCount + rating;
    const newRating = totalRating / (product.rate.ratingCount + 1);
    product.rate.rating = newRating;
    product.rate.ratingCount += 1;
    await product.save();
  }
  const userInformation = await catchDbErrors(
    UserModel.findById(req.user._id, "name avatar")
  );
  newComment.userId = userInformation;
  res.json(new CustomSuccess(newComment));
}

/**
 * @method get
 * @endpoint  ~/api/comment/getcomments/:productId
 * @description get all comments for a product
 * @access visitor
 */
async function getProductCommentsController(req, res) {
  const product = await catchDbErrors(
    ProductModel.findById(req.params.productId)
  );
  if (!product) {
    throw new CustomFail("product not found");
  }
  const productComments = await catchDbErrors(
    CommentModel.find({ productId: product._id })
      .populate("userId", "avatar name")
  );
  res.json(new CustomSuccess(productComments));
}

/**
 * @method delete
 * @endpoint  ~/api/comment/delete/:id
 * @description delete user's Comments
 * @access user 
 */
async function deleteCommentsController(req, res) {
  const comment = await catchDbErrors(CommentModel.findById(req.params.id));
  if (!comment) {
    throw new CustomFail("comment not found");
  }

  if (req.user._id.toString() !== comment.userId.toString()) {
    throw new CustomFail("unauthorized");
  }
  const deletedComment = await catchDbErrors(
    CommentModel.findByIdAndDelete(req.params.id)
  );
  res.json(new CustomSuccess(deletedComment));
}

/**
 * @method delete
 * @endpoint  ~/api/comment/deleteadmin/:id
 * @description delete Comments by admin
 * @access admin
 */
async function adminDeleteCommentController(req, res) {
  const deletedComment = await catchDbErrors(
    CommentModel.findByIdAndDelete(req.params.id)
  );

  res.json(new CustomSuccess(deletedComment));
}
module.exports = {
  postNewCommentController,
  getProductCommentsController,
  deleteCommentsController,
  adminDeleteCommentController,
};
