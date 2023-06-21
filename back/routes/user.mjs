import SignUp from "../controlar/user.mjs"
import {verification,login,getUser,uploadImage,updateInfo,changePassword,getAllUsers,deleteUser} from "../controlar/user.mjs"
import verifyToken from "../controlar/jwt.mjs"
const user= (app)=>{
    app.post("/SignUp",SignUp) ; 
    app.post("/verification",verification) ;  
    app.post("/login",login) ;  
    app.post("/getUser",verifyToken,getUser) ;
    app.post("/uploadImage",verifyToken,uploadImage) ;
    app.post("/updateInfo",verifyToken,updateInfo) ;
    app.post("/changePassword",verifyToken,changePassword) ;
    app.get("/getAllUsers",verifyToken,getAllUsers) 
    app.delete("/deleteUser/:email",verifyToken,deleteUser)

  
 }
 
export default  user
 