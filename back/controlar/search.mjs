import Trip from '../models/trips.mjs';
const search = (req, res) => {
    const { from, to,date } = req.body;
   console.log(req.body);
    Trip
        .find({from:from,to:to,date:{$eq:date }})
        .then((result) => {
          res.status(200).json(result);
          console.log(result);
        })
        .catch((err) => console.log(err));
}

export default search