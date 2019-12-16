import { UsersService, BadgesService } from "../../../services";
import config from "../../../../config";
import { konsole } from "../../../../handlr";

export const get_html_id_name = (req, res) => {
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
      : new Promise(resolve => resolve([])),
    UsersService.followers(req.params.id),
    UsersService.following(req.params.id)
  ])
    .then(results => {
      const user = results[0];
      const badges = results[1];
      const latestActivity = results[2];
      const reviews = results[3];
      const claimedListings = results[4];
      const followers = results[5];
      const following = results[6];
      const isFollowing =
        followers.filter(
          f =>
            f.follower._id.toString() === req.authentication.user._id.toString()
        ).length > 0;
      const isLoggedInUser =
        user._id.toString() == req.authentication.user._id.toString();

      res.render("user", {
        authentication: req.authentication,
        title: "User Profile - BoredPass",
        user,
        badges,
        latestActivity,
        reviews,
        claimedListings,
        followers,
        following,
        isFollowing,
        isLoggedInUser,
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
