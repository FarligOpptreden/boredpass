export const get_html_add = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addExperience
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

  res.render("add_activity", {
    authentication: req.authentication,
    title: "Add Activity - BoredPass",
    mode: "new",
    moment: require("moment"),
    listing_id: req.query.listing,
    categories: req.listing_categories
  });
};
