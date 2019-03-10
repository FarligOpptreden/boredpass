import { ActivitiesService } from "../../../services";

export const get_html_id_edit = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.editExperience
  ) {
    res.status(403);
    res.render("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      categories: req.listing_categories
    });
    return;
  }

  ActivitiesService.findOne({ filter: req.params.id })
    .then(activity =>
      res.render("add_activity", {
        authentication: req.authentication,
        title: `Edit ${activity.name} - BoredPass`,
        mode: "edit",
        activity: activity,
        moment: require("moment"),
        categories: req.listing_categories
      })
    )
    .catch(err => {
      res.status(500);
      res.render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`,
        categories: req.listing_categories
      });
    });
};
