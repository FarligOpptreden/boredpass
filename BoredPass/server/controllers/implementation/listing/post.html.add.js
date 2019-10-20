import { ListingsService } from "../../../services";
import config from "../../../../config";
import { StringUtils } from "../../../utils";

export const post_html_add = async (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addExperience
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
    const result = await ListingsService.create({
      data: req.body,
      user: req.authentication.user
    });
    res.render("partials/add_listing_result", {
      success: result && result._id && true,
      isModerator:
        (req.authentication &&
          req.authentication.isAuthenticated &&
          req.authentication.user.permissions &&
          req.authentication.user.permissions.moderateListing &&
          true) ||
        false,
      id: result._id && result._id,
      listing: result,
      makeUrlFriendly: StringUtils.makeUrlFriendly,
      marked: require("marked"),
      moment: require("moment"),
      categories: req.listing_categories
    });
  } catch (err) {
    res.status(500).render("error", {
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`,
      categories: req.listing_categories,
      moment: require("moment")
    });
  }
};
