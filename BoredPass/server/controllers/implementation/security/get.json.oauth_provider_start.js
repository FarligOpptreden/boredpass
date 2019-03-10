import { SecurityService } from "../../../services";
import config from "../../../../config";

export const get_json_oauth_provider_start = (req, res) => {
  let provider = config.oauth[req.params.provider];

  SecurityService[`start_${req.params.provider}`]({
    req: req,
    res: res,
    provider: provider
  });
};
