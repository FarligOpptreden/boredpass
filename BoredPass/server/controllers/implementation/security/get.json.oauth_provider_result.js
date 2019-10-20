import { SecurityService } from "../../../services";
import config from "../../../../config";

export const get_json_oauth_provider_result = async (req, res) => {
  try {
    let provider = config.oauth[req.params.provider];
    const result = SecurityService[`end_${req.params.provider}`]({
      req: req,
      res: res,
      provider: provider
    });
    res.cookie(
      "bp",
      Buffer.from(`${result.userId}:${result.token}`).toString("base64"),
      {
        maxAge: 3600000 * 24 * 365, // 1 year
        httpOnly: true
      }
    );
    res.redirect(req.cookies.oauth_redirect);
  } catch (err) {
    res.status(500).send(err);
  }
};
