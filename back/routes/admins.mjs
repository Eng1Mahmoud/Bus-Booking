import {login,getAdmins,deleteAdmin,addAdmin,book,deleteTrip,AddTrip} from "../controlar/admins.mjs";
import verifyToken from "../controlar/jwt.mjs";
export const admins = (app) => {
    app.post("/admin/login", login);
    app.get("/admin/getAdmins",verifyToken, getAdmins);
    app.delete("/admin/deleteAdmin/:email",verifyToken, deleteAdmin);
    app.post("/admin/addAdmin",verifyToken, addAdmin);
    app.post("/admin/book",verifyToken, book);
    app.delete("/admin/deleteTrip/:from/:to/:date/:busNumber",verifyToken, deleteTrip);
    app.post("/admin/AddTrip",verifyToken, AddTrip);

}