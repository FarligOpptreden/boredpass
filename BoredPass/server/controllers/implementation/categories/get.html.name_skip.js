import { ListingsService } from "../../../services";
import { StringUtils } from "../../../utils";
import config from "../../../../config";

export const get_html_name_skip = (req, res) =>
  ListingsService.listingsByCategory({
    category: req.params.name,
    coordinates:
      req.query.lat && req.query.lng
        ? { lat: req.query.lat, lng: req.query.lng }
        : null,
    skip: req.params.skip || 0,
    limit: req.query.limit || 12
  })
    .then(listings => {
      let categories = ListingsService.unmappedCategories(req.params.name);
      res.render("partials/category_listing_cards", {
        moment: require("moment"),
        marked: require("marked"),
        listings: listings,
        category: ListingsService.mappedCategory(req.params.name),
        categories: Object.keys(categories).map(k => {
          return {
            url: k,
            name: categories[k]
          };
        }),
        calculateBearing: ListingsService.calculateBearing,
        location:
          req.query.lat && req.query.lng
            ? [req.query.lng, req.query.lat]
            : null,
        limit: req.query.limit || 12,
        makeUrlFriendly: StringUtils.makeUrlFriendly
      });
    })
    .catch(err => {
      res.status(500);
      res.render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`
      });
    });
