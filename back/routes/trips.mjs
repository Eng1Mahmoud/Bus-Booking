import {getTrips} from "../controlar/trips.mjs"
import verifyToken from "../controlar/jwt.mjs";
export const trips = (app) => {
 app.get("/admin/getTrips",verifyToken, getTrips);
 
}