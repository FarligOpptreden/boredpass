import { TagsService } from "../../../services";
import config from "../../../../config";

export const get_html_tags_list = (req, res) =>
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
    );
