import config from "../../../../config";
import { RatingsService } from "../../../services";
import moment from "moment";

const DATE_FORMAT = "DD MMM YYYY";
const FRIENDLY_LIMIT = 3;

export const get_html_id_reviews = (req, res) => {
  RatingsService.findMany({
    filter: { "listing._id": RatingsService.db.objectId(req.params.id) },
    sort: { _id: -1 }
  })
    .then(ratings => {
      res.render("partials/listing_reviews", {
        authentication: req.authentication,
        ratings: ratings.map(r => {
          let d = moment(r._created);
          r.date =
            moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          return r;
        })
      });
    })
    .catch(err =>
      res.status(500).render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`
      })
    );
};
