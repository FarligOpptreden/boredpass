import { FacilitiesService, CountriesService } from "../../../services";
import config from "../../../../config";

export const get_html_add_wizard = async (req, res) => {
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
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
    });

  try {
    const facilities = await FacilitiesService.findMany({ sort: { name: 1 } });
    const countries = await CountriesService.findMany({ sort: { name: 1 } });
    res.render("partials/add_listing_wizard", {
      moment: require("moment"),
      countries: countries,
      facilities: facilities
    });
  } catch (err) {
    res.status(500).render("error", {
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`
    });
  }
};
