const { registerController, loginController, loginAdminController, checkTokenController, validateUserController } = require('../controllers/auth')
const asyncHandler = require('../utils/asyncHandler')
const verifyAdmin = require('../utils/verifyAdmin')

const authRouter=require('express').Router()

/**
 * @method post
 * @endpoint  ~/api/auth/register
 * @description register a new user
 * @accsess visitor
 *  */
authRouter.post("/register",asyncHandler(registerController))


/**
 * @method post
 * @endpoint  ~/api/auth/login
 * @description login user
 * @accsess visitor
 *  */
// authRouter.post("/login",asyncHandler(loginController))

/**
 * @method post
 * @endpoint  ~/api/auth/loginadmin
 * @description login admin, coordinator, ambassador
 * @accsess visitor
 *  */
// authRouter.post("/loginadmin",asyncHandler(loginAdminController))

/**
 * @method post
 * @endpoint  ~/api/auth/checkToken
 * @description login user
 * @accsess admin
 *  */
authRouter.post("/checkToken",asyncHandler(verifyAdmin),asyncHandler(checkTokenController))

/**
 * @method get
 * @endpoint  ~/api/auth/validateUser/:hash
 * @description validate user
 * @accsess visitor
 *  */
authRouter.get("/validateUser/:hash",asyncHandler(validateUserController))

module.exports=authRouter