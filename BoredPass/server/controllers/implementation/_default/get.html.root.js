import { ListingsService } from "../../../services";
import { StringUtils } from "../../../utils";

export const get_html_root = (req, res) => {
  let promise = null,
    promiseArgs = null;

  if (req.query.lat && req.query.lng) {
    promise = ListingsService.listingsWithProximity;
    promiseArgs = { lat: req.query.lat, lng: req.query.lng };
  }

  if (req.query.all) {
    promise = ListingsService.defaultListings;
    promiseArgs = {};
  }

  if (promise) {
    let categories = [];
    return Promise.resolve()
      .then(_ => {
        categories = req.listing_categories;
        return Promise.all(
          categories.map(c => {
            let args = promiseArgs;
            args.tags = c.tags;
            args.limit = 3;
            return promise(args);
          })
        );
      })
      .then(listings =>
        res.render("partials/listing_cards", {
          authentication: req.authentication,
          categories: categories.map((c, i) => {
            return {
              category: c.category,
              urlCategory: c.urlCategory,
              loading: false,
              listings: listings[i]
            };
          }),
          calculateBearing: ListingsService.calculateBearing,
          location:
            req.query.lat && req.query.lng
              ? [req.query.lng, req.query.lat]
              : null,
          moment: require("moment"),
          marked: require("marked"),
          makeUrlFriendly: StringUtils.makeUrlFriendly
        })
      );
  }

  let renderArgs = {
    title: "Experiences Near You - BoredPass",
    categories: req.listing_categories.map((c, i) => {
      return {
        category: c.category,
        urlCategory: c.urlCategory,
        loading: true
      };
    }),
    moment: require("moment"),
    marked: require("marked"),
    minimalBanner: true,
    authentication: req.authentication
  };

  if (
    req.authentication &&
    req.authentication.user &&
    req.authentication.user.permissions &&
    req.authentication.user.permissions.viewStatistics
  )
    return ListingsService.statistics().then(tags => {
      renderArgs.tags = tags;
      res.render("home", renderArgs);
    });

  res.render("home", renderArgs);
};
