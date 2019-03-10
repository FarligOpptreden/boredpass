import {
  ListingsService,
  ActivitiesService,
  FacilitiesService
} from "../../../services";
import config from "../../../../config";

export const get_html_id_edit = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.editListing
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

  let _listing, _facilities, _activities;

  let getFacilities = listing =>
    new Promise((resolve, reject) =>
      FacilitiesService.findMany({ sort: { name: 1 } })
        .then(facilities => {
          listing.facilities &&
            listing.facilities.length &&
            listing.facilities.map(facility =>
              facilities.map(f => {
                if (
                  f &&
                  facility &&
                  f._id.toString() === facility._id.toString()
                )
                  f.selected = true;
              })
            );
          _facilities = facilities;
          resolve(facilities);
        })
        .catch(err => reject(err))
    );

  let getActivities = listing =>
    new Promise((resolve, reject) =>
      ActivitiesService.findMany({
        filter: { listing_id: listing._id },
        sort: { name: 1 }
      })
        .then(activities => {
          _activities = activities;
          resolve(activities);
        })
        .catch(err => reject(err))
    );

  Promise.resolve()
    .then(_ => ListingsService.findOne({ filter: req.params.id }))
    .then(listing => {
      _listing = listing;
      return Promise.all([getFacilities(listing), getActivities(listing)]);
    })
    .then(_ =>
      res.render("listing_edit", {
        authentication: req.authentication,
        title: _listing.name + " - BoredPass",
        moment: require("moment"),
        marked: require("marked"),
        listing: _listing,
        activities: _activities,
        facilities: _facilities,
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
        categories: req.listing_categories
      })
    );
};
