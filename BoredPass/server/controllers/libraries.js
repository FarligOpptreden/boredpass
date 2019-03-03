import config from "../../config";
import Controller from "../../handlr/Controller";
import { TagsService, ContentService } from "../services";

export default new Controller("/libraries")
  .handle(
    { route: "/tags/search", method: "get", produces: "json" },
    (req, res) =>
      TagsService.findMany({
        filter: { name: { $regex: `^${req.query.search}.*`, $options: "i" } },
        sort: { name: 1 },
        limit: 5
      })
        .then(tags => res.json(tags))
        .catch(err => res.json(null))
  )
  .handle(
    { route: "/tags/list", method: "get", produces: "html" },
    (req, res) =>
      TagsService.findMany({
        filter: {},
        sort: { name: 1 }
      })
        .then(tags =>
          res.render("partials/tag_library", {
            authentication: req.authentication,
            tags: tags
          })
        )
        .catch(err =>
          res.status(500).render("error", {
            error: {
              status: 500,
              stack: config.app.debug && err.stack
            },
            message: `Something unexpected happened: ${err}`
          })
        )
  )
  .handle(
    { route: "/banners/list", method: "get", produces: "html" },
    (req, res) =>
      ContentService.listBanners(null)
        .then(files =>
          res.render("partials/banner_library", {
            authentication: req.authentication,
            banners: files
          })
        )
        .catch(err =>
          res.status(500).render("error", {
            error: {
              status: 500,
              stack: config.app.debug && err.stack
            },
            message: `Something unexpected happened: ${err}`
          })
        )
  );
