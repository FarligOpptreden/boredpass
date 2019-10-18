import { ListingsService } from "../../../services";
import config from "../../../../config";

export const post_json_id_claim = (req, res) => {
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

  // >>>>>>>>>>>>> TODO: Implement claim mail sending here

  ListingsService.initiateClaim({
    listing_id: req.params.id,
    user: req.authentication.user
  })
    .then(r => res.json(r))
    .catch(err =>
      res.status(500).json({
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`
      })
    );
};
