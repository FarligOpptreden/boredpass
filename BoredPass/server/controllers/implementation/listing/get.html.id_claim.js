import { ListingsService } from "../../../services";
import config from "../../../../config";

export const get_html_id_claim = (req, res) =>
  ListingsService.verifyClaim({
    listing_id: req.params.id,
    token: req.query.token
  })
    .then(result =>
      res.render("listing_claim_result", {
        authentication: req.authentication,
        title: "Claim Listing - BoredPass",
        moment: require("moment"),
        claimResult: result,
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
