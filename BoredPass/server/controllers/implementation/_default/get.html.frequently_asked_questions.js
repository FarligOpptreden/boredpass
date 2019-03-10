export const get_html_frequently_asked_questions = (req, res) =>
  res.render("faq", {
    authentication: req.authentication,
    title: "Frequently Asked Questions - BoredPass",
    categories: req.listing_categories
  });
