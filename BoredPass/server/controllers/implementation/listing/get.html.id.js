import {
  ListingsService,
  ActivitiesService,
  RatingsService
} from "../../../services";
import { StringUtils } from "../../../utils";
import config from "../../../../config";

export const get_html_id = (req, res) => {
  const listingId = ListingsService.db.objectId(req.params.id);
  let _listing = null,
    _activities = null,
    _ratingCount = null,
    _ratings;

  Promise.all([
    ListingsService.findOne({ filter: listingId }),
    ActivitiesService.findMany({
      filter: { listing_id: listingId },
      sort: { name: 1 }
    }),
    RatingsService.aggregate({
      pipeline: [
        { filter: { "listing._id": listingId } },
        {
          group: {
            _id: "$listing._id",
            rating: { $avg: "$rating" },
            count: { $sum: 1 }
          }
        }
      ]
    })
  ])
    .then(results => {
      _listing = results[0];
      _activities = results[1];
      _ratingCount = results[2];
      _ratings =
        _ratingCount && _ratingCount.length
          ? {
              rating: Math.round(_ratingCount[0].rating),
              count: _ratingCount[0].count
            }
          : { rating: 0, count: 0 };
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
        ratings: _ratings,
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
