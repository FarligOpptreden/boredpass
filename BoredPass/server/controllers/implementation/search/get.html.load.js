export const get_html_load = (req, res) =>
  res.render("partials/find", {
    moment: require("moment"),
    categories: req.listing_categories
  });
