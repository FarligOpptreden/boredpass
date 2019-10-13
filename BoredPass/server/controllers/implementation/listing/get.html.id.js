import { ListingsService, ActivitiesService } from "../../../services";
import { StringUtils } from "../../../utils";
import config from "../../../../config";

export const get_html_id = (req, res) => {
  let _listing = null,
    _activities = null;

  Promise.all([
    ListingsService.findOne({ filter: req.params.id }),
    ActivitiesService.findMany({
      filter: { listing_id: req.params.id },
      sort: { name: 1 }
    })
  ])
    .then(results => {
      _listing = results[0];
      _activities = results[1];
      return ListingsService.relatedListings(_listing);
    })
    .then(related =>
      res.render("listing", {
        authentication: req.authentication,
        title: _listing.name + " - BoredPass",
        moment: require("moment"),
        marked: require("marked"),
        listing: _listing,
        activities: _activities,
        related: related,
        makeUrlFriendly: StringUtils.makeUrlFriendly,
        location: (_listing.location && _listing.location.coordinates) || null,
        calculateBearing: ListingsService.calculateBearing,
        categories: req.listing_categories
      })
    )
    .catch(err =>
      res.status(500).render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`,
        categories: req.listing_categories
      })
    );
};
