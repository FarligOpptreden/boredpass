import { ContentService } from "../../../services";
import config from "../../../../config";

export const get_html_banners_list = (req, res) =>
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
    );
