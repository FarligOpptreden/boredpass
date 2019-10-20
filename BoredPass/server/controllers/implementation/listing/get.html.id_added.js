import { ListingsService } from "../../../services";
import config from "../../../../config";

export const get_html_id_added = async (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addListing
  )
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
    const listing = await ListingsService.findOne({
      filter: { _id: req.params.id }
    });
    res.render("add_listing_done", {
      authentication: req.authentication,
      title: "Add Listing - BoredPass",
      moment: require("moment"),
      listing: listing,
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
