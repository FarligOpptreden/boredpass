import { SecurityService } from "../../../services";

export const post_json_sign_in = (req, res) =>
  SecurityService.signIn(req.body, res)
    .then(r => res.send(r))
    .catch(err => res.send(err));
