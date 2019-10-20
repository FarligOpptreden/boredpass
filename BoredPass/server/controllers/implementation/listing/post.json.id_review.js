import config from "../../../../config";
import { ListingsService, RatingsService } from "../../../services";
import { StringUtils } from "../../../utils";

export const post_json_id_review = async (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).json({
      success: false,
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
    });

  try {
    const listing = await ListingsService.findOne({ filter: req.params.id });
    await RatingsService.updateOrCreate({
      filter: {
        "user._id": RatingsService.db.objectId(req.authentication.user._id),
        "listing._id": RatingsService.db.objectId(listing._id)
      },
      data: {
        user: {
          _id: req.authentication.user._id,
          name: req.authentication.user.name,
          profile_pictures: req.authentication.user.profile_pictures
        },
        listing: listing,
        rating: parseInt(req.body.rating, 10),
        review: req.body.review,
        meta: {
          title: listing.name,
          link: `/listings/${listing._id}/${StringUtils.makeUrlFriendly(
            listing.name
          )}/#/ratings/{_id}`,
          icon:
            listing.logo.location ||
            `/content/${listing.logo.fileType.replace(".", "")}/${
              listing.logo.fileId
            }`
        }
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: err.toString()
    });
  }
};
