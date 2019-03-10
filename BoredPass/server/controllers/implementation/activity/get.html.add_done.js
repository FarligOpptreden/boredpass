export const get_html_add_done = (req, res) => {
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

  res.render("add_listing_done", {
    authentication: req.authentication,
    title: "Activity Added - BoredPass",
    moment: require("moment"),
    categories: req.listing_categories
  });
};
