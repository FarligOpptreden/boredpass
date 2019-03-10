import { UsersService, BadgesService } from "../../../services";

export const get_html_id = (req, res) =>
  Promise.all([
    UsersService.findOne({ filter: req.params.id }),
    BadgesService.findAll(),
    UsersService.latestActivity(),
    UsersService.ratingsAndReviews()
  ])
    .then(results => {
      let user = results[0];
      let badges = results[1];
      let latestActivity = results[2];
      let ratingsAndReviews = results[3];

      res.render("user", {
        authentication: req.authentication,
        title: "User Profile - BoredPass",
        categories: req.listing_categories,
        user: user,
        badges: badges,
        latestActivity: latestActivity,
        reviews: ratingsAndReviews
      });
    })
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
