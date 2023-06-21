import    Trip from "../models/trips.mjs"


//get all trips
export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
        res.json(trips)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};

