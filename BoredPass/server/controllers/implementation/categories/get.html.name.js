import { ListingsService } from "../../../services";

export const get_html_name = (req, res) =>
  res.render("category_listings", {
    authentication: req.authentication,
    title: `${ListingsService.mappedCategory(
      req.params.name
    )} Experiences - BoredPass`,
    moment: require("moment"),
    marked: require("marked"),
    category: ListingsService.mappedCategory(req.params.name),
    urlCategory: req.params.name,
    listings: [],
    skip: (req.query.skip || 0) + (req.query.limit || 12),
    categories: req.listing_categories
  });
