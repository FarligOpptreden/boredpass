import config from "../../../../config";

export const get_html_id_review = (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).render("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      categories: req.listing_categories
    });

  res.render("partials/add_listing_review", {
    rating: req.query.rating,
    id: req.params.id
  });
};
