const jwt=require('jsonwebtoken')

function jwtGenerateToken(id){
   return jwt.sign({id:id}, process.env.JWT,{expiresIn:"24h"});
}

module.exports=jwtGenerateToken