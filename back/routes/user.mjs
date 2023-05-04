import SignUp from "../controlar/user.mjs"
import {verification,login,getUser,uploadImage,updateInfo,changePassword} from "../controlar/user.mjs"
import verifyToken from "../controlar/jwt.mjs"
const user= (app)=>{
    app.post("/SignUp",SignUp) ; 
    app.post("/verification",verification) ;  
    app.post("/login",login) ;  
    app.post("/getUser",verifyToken,getUser) ;
    app.post("/uploadImage",verifyToken,uploadImage) ;
    app.post("/updateInfo",verifyToken,updateInfo) ;
    app.post("/changePassword",verifyToken,changePassword) ;

  
 }
 
export default  user
 