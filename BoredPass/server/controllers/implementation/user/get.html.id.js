import { UsersService, BadgesService } from "../../../services";
import config from "../../../../config";

export const get_html_id = (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).render("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      req: req
    });

  Promise.all([
    UsersService.findOne({ filter: req.params.id }),
    BadgesService.findAll(),
    UsersService.latestActivity({
      filter: {
        "user._id": UsersService.db.objectId(req.params.id)
      },
      sort: { _id: -1 }
    }),
    UsersService.ratingsAndReviews({
      filter: {
        "user._id": UsersService.db.objectId(req.params.id)
      },
      sort: { _id: -1 }
    }),
    req.authentication.user._id.toString() === req.params.id
      ? UsersService.claimedListings({
          filter: { "claim.user._id": UsersService.db.objectId(req.params.id) },
          sort: { "claim.claimedOn": -1 }
        })
      : new Promise(resolve => resolve([]))
  ])
    .then(results => {
      let user = results[0];
      let badges = results[1];
      let latestActivity = results[2];
      let ratingsAndReviews = results[3];
      let claimedListings = results[4];

      res.render("user", {
        authentication: req.authentication,
        title: "User Profile - BoredPass",
        user: user,
        badges: badges,
        latestActivity: latestActivity,
        reviews: ratingsAndReviews,
        claimedListings: claimedListings,
        req: req
      });
    })
    .catch(err =>
      res.status(500).render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`,
        req: req
      })
    );
};
