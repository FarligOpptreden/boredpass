import { ListingsService } from "../../../services";
import { Utils } from "../../../../handlr";

export const put_json_id_edit = (req, res) => {
  let isAuthenticated =
    req.authentication && req.authentication.isAuthenticated;

  if (!isAuthenticated)
    return res.status(403).json("error", {
      success: false,
      error: {
        status: 403
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
    });

  let listing = req.body;

  ListingsService.findOne({
    filter: req.params.id
  })
    .then(listing => {
      let hasEditPermission =
        req.authentication.user.permissions &&
        req.authentication.user.permissions.editListing;
      let isOwner =
        listing.claim &&
        listing.claim.status === "verified" &&
        listing.claim.user &&
        listing.claim.user._id.toString() ===
          req.authentication.user._id.toString();

      if (!hasEditPermission && !isOwner)
        return Utils.reject({
          status: 403,
          message:
            "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
        });

      return Utils.resolve();
    })
    .then(_ =>
      ListingsService.update({
        filter: req.params.id,
        data: listing
      })
    )
    .then(result =>
      res.json({
        success: result && true,
        id: result && req.params.id
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        error: {
          status: err.status || 500
        },
        message: err.message || `Something unexpected happened: ${err}`
      })
    );
};
