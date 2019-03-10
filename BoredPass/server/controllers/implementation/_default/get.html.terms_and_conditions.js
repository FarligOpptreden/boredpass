export const get_html_terms_and_conditions = (req, res) =>
  res.render("terms-and-conditions", {
    authentication: req.authentication,
    title: "Terms & Conditions - BoredPass",
    categories: req.listing_categories
  });
