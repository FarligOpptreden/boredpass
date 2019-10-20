import {
  ListingsService,
  ActivitiesService,
  RatingsService
} from "../../../services";
import { StringUtils } from "../../../utils";
import config from "../../../../config";

export const get_html_id = async (req, res) => {
  try {
    const listingId = ListingsService.db.objectId(req.params.id);
    const data = await Promise.all([
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
      }),
      RatingsService.findMany({
        filter: { "listing._id": listingId },
        sort: { _id: -1 },
        limit: 5
      })
    ]);
    const listing = data[0];
    const activities = data[1];
    const ratingCount = data[2];
    const ratings = data[3];
    const ratingData =
      ratingCount && ratingCount.length
        ? {
            rating: Math.round(ratingCount[0].rating),
            count: ratingCount[0].count
          }
        : { rating: 0, count: 0 };
    const related = await ListingsService.relatedListings(listing);
    res.render("listing", {
      authentication: req.authentication,
      title: listing.name + " - BoredPass",
      moment: require("moment"),
      marked: require("marked"),
      listing: listing,
      activities: activities,
      related: related,
      ratings: ratingData,
      latestReviews: ratings,
      makeUrlFriendly: StringUtils.makeUrlFriendly,
      location: (listing.location && listing.location.coordinates) || null,
      calculateBearing: ListingsService.calculateBearing,
      categories: req.listing_categories
    });
  } catch (err) {
    res.status(500).render("error", {
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`,
      categories: req.listing_categories
    });
  }
};
