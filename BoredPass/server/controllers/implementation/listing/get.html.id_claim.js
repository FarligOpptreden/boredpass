import { ListingsService } from "../../../services";
import config from "../../../../config";
import { StringUtils } from "../../../utils";

export const get_html_id_claim = (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).render("listing_claim_result", {
      title: "Claim Listing - BoredPass",
      claimResult: {
        success: false,
        message:
          "You need to be signed into your BoredPass account in order to claim this listing."
      },
      categories: req.listing_categories,
      moment: require("moment")
    });

  ListingsService.verifyClaim({
    listing_id: req.params.id,
    token: req.query.token,
    user: req.authentication.user
  })
    .then(result =>
      res.render("listing_claim_result", {
        authentication: req.authentication,
        title: "Claim Listing - BoredPass",
        moment: require("moment"),
        marked: require("marked"),
        claimResult: result,
        makeUrlFriendly: StringUtils.makeUrlFriendly,
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
        categories: req.listing_categories,
        moment: require("moment")
      })
    );
};
