import {
  ListingsService,
  ActivitiesService,
  FacilitiesService
} from "../../../services";
import config from "../../../../config";

export const get_html_id_edit = async (req, res) => {
  let isAuthenticated =
    req.authentication && req.authentication.isAuthenticated;

  if (!isAuthenticated)
    return res.status(403).render("error", {
      error: {
        status: 403
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      categories: req.listing_categories
    });

  try {
    const listing = await ListingsService.findOne({ filter: req.params.id });

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
      throw {
        status: 403,
        message:
          "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
      };

    const meta = await Promise.all([
      FacilitiesService.findMany({ sort: { name: 1 } }),
      ActivitiesService.findMany({
        filter: { listing_id: listing._id },
        sort: { name: 1 }
      })
    ]);
    const facilities = meta[0];
    const activities = meta[1];

    listing.facilities &&
      listing.facilities.length &&
      listing.facilities.map(facility =>
        facilities.map(f => {
          if (f && facility && f._id.toString() === facility._id.toString())
            f.selected = true;
        })
      );

    res.render("listing_edit", {
      authentication: req.authentication,
      title: listing.name + " - BoredPass",
      moment: require("moment"),
      marked: require("marked"),
      listing: listing,
      activities: activities,
      facilities: facilities,
      categories: req.listing_categories
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
