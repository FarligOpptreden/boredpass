import { ActivitiesService, ListingsService } from "../../../services";
import marked from "marked";

marked.setOptions({
  gfm: true,
  breaks: true
});

export const get_html_id = (req, res) =>
  Promise.resolve()
    .then(_ => ActivitiesService.findOne({ filter: req.params.id }))
    .then(activity =>
      ListingsService.findOne({ filter: { _id: activity.listing_id } })
    )
    .then(listing =>
      res.render("activity", {
        authentication: req.authentication,
        title: `${activity.name} - BoredPass`,
        listing: listing,
        activity: activity,
        marked: marked,
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
