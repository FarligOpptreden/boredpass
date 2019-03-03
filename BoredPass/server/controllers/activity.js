import config from "../../config";
import Controller from "../../handlr/Controller";
import { ActivitiesService, ListingsService } from "../services";
import marked from "marked";

marked.setOptions({
  gfm: true,
  breaks: true
});

export default new Controller("/activities")
  .handle({ route: "/add", method: "get", produces: "html" }, (req, res) => {
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
  })
  .handle(
    { route: "/:id/add", method: "post", produces: "json" },
    (req, res) => {
      if (
        !req.authentication ||
        !req.authentication.isAuthenticated ||
        !req.authentication.user.permissions ||
        !req.authentication.user.permissions.addExperience
      ) {
        res.status(403);
        res.send({
          success: false,
          message: "Unauthorized"
        });
        return;
      }

      let activity = req.body;
      activity.listing_id = ActivitiesService.db.objectId(req.params.id);
      ActivitiesService.create({ data: activity })
        .then(result =>
          res.json({
            success: result && result._id && true,
            id: result._id && result._id
          })
        )
        .catch(err => {
          res.status(500);
          res.send({
            success: false,
            message: `Could not create activity: ${err}`
          });
        });
    }
  )
  .handle(
    { route: "/add/done", method: "get", produces: "html" },
    (req, res) => {
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
    }
  )
  .handle({ route: "/:id", method: "get", produces: "html" }, (req, res) =>
    Promise.resolve()
      .then(_ => ActivitiesService.findOne({ filter: req.params.id }))
      .then(activity =>
        ListingsService.findOne({ filter: { _id: activity.listing_id } })
      )
      .then(listing =>
        res.render("activity", {
          authentication: req.authentication,
          title: `${activity.name} - BoredPass`,
          listing: listing,
          activity: activity,
          marked: marked,
          moment: require("moment"),
          categories: req.listing_categories
        })
      )
      .catch(err => {
        res.status(500);
        res.render("error", {
          error: {
            status: 500,
            stack: config.app.debug && err.stack
          },
          message: `Something unexpected happened: ${err}`,
          categories: req.listing_categories
        });
      })
  )
  .handle(
    { route: "/:id/edit", method: "get", produces: "html" },
    (req, res) => {
      if (
        !req.authentication ||
        !req.authentication.isAuthenticated ||
        !req.authentication.user.permissions ||
        !req.authentication.user.permissions.editExperience
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

      ActivitiesService.findOne({ filter: req.params.id })
        .then(activity =>
          res.render("add_activity", {
            authentication: req.authentication,
            title: `Edit ${activity.name} - BoredPass`,
            mode: "edit",
            activity: activity,
            moment: require("moment"),
            categories: req.listing_categories
          })
        )
        .catch(err => {
          res.status(500);
          res.render("error", {
            error: {
              status: 500,
              stack: config.app.debug && err.stack
            },
            message: `Something unexpected happened: ${err}`,
            categories: req.listing_categories
          });
        });
    }
  )
  .handle(
    { route: "/:id/edit", method: "put", produces: "json" },
    (req, res) => {
      if (
        !req.authentication ||
        !req.authentication.isAuthenticated ||
        !req.authentication.user.permissions ||
        !req.authentication.user.permissions.editExperience
      ) {
        res.status(403);
        res.send({
          success: false,
          message: "Unauthorized"
        });
        return;
      }

      let activity = req.body;
      ActivitiesService.update({ filter: req.params.id, data: activity })
        .then(result =>
          res.json({
            success: result && true,
            id: result && req.params.id
          })
        )
        .catch(err => {
          res.status(500);
          res.render("error", {
            error: {
              status: 500,
              stack: config.app.debug && err.stack
            },
            message: `Something unexpected happened: ${err}`
          });
        });
    }
  )
  .handle(
    { route: "/:id/delete", method: "delete", produces: "json" },
    (req, res) => {
      if (
        !req.authentication ||
        !req.authentication.isAuthenticated ||
        !req.authentication.user.permissions ||
        !req.authentication.user.permissions.deleteExperience
      ) {
        res.status(403);
        res.send({
          success: false,
          message: "Unauthorized"
        });
        return;
      }

      ActivitiesService.delete({ filter: req.params.id })
        .then(r => res.json(r))
        .catch(err => {
          res.status(500);
          res.render("error", {
            error: {
              status: 500,
              stack: config.app.debug && err.stack
            },
            message: `Something unexpected happened: ${err}`
          });
        });
    }
  );
