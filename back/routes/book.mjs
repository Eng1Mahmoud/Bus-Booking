import book from "../controlar/book.mjs";
import verifyToken from "../controlar/jwt.mjs";
const books= (app)=>{
    app.post("/book",verifyToken,book) ;  
  
 }
export default books
 