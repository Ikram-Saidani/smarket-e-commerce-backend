const {getProductCommentsController, postNewCommentController, deleteCommentsController, adminDeleteCommentController} = require('../controllers/comment')
const asyncHandler = require('../utils/asyncHandler')
const CommentRouter=require('express').Router()
const verifyAdmin=require('../utils/verifyAdmin')
const verifyUser = require('../utils/verifyUser')


/**
 * @method post
 * @endpoint  ~/api/comment/addcomment/:productId
 * @description post a comment for a product
 * @access user
 */
CommentRouter.post('/addcomment/:productId',asyncHandler(verifyUser),asyncHandler(postNewCommentController))


/**
 * @method get
 * @endpoint  ~/api/comment/getcomments/:productId
 * @description get prduct Comments
 * @access vesitor
 */

CommentRouter.get('/getcomments/:productId',asyncHandler(getProductCommentsController))

/**
 * @method delete
 * @endpoint  ~/api/comment/delete/:id
 * @description delete Comments
 * @access user 
 */

CommentRouter.delete('/delete/:id',asyncHandler(verifyUser),asyncHandler(deleteCommentsController))


/**
 * @method delete
 * @endpoint  ~/api/comment/deleteadmin/:id
 * @description delete Comments
 * @access admin
 */

CommentRouter.delete('/deleteadmin/:id',asyncHandler(verifyAdmin),asyncHandler(adminDeleteCommentController))

module.exports=CommentRouter