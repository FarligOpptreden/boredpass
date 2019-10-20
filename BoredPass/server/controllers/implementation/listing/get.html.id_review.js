import config from "../../../../config";
import { RatingsService } from "../../../services";

export const get_html_id_review = async (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).render("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      categories: req.listing_categories
    });

  try {
    const r = await RatingsService.findOne({
      filter: {
        "listing._id": RatingsService.db.objectId(req.params.id),
        "user._id": RatingsService.db.objectId(req.authentication.user._id)
      }
    });
    res.render("partials/add_listing_review", {
      existingRating: r,
      rating: req.query.rating,
      id: req.params.id
    });
  } catch (err) {
    res.status(err.status || 500).render("error", {
      error: {
        status: err.status || 500,
        stack: config.app.debug && err.stack
      },
      message: err.message || `Something unexpected happened: ${err}`,
      categories: req.listing_categories,
      moment: require("moment")
    });
  }
};
