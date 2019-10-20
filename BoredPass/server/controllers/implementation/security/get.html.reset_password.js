import { SecurityService } from "../../../services";
import config from "../../../../config";
import { StringUtils } from "../../../utils";

export const get_html_reset_password = async (req, res) => {
  try {
    const result = await SecurityService.verifyPasswordReset({
      token: req.query.token
    });
    res.render("password_reset_result", {
      authentication: req.authentication,
      title: "Reset Password - BoredPass",
      moment: require("moment"),
      marked: require("marked"),
      resetResult: result,
      makeUrlFriendly: StringUtils.makeUrlFriendly,
      categories: req.listing_categories
    });
  } catch (err) {
    res.status(500).render("error", {
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`,
      categories: req.listing_categories,
      moment: require("moment")
    });
  }
};
