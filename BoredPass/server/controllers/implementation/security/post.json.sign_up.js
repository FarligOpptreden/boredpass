import { SecurityService } from "../../../services";

export const post_json_sign_up = (req, res) =>
  SecurityService.signUp(req.body)
    .then(r => res.send(r))
    .catch(err => res.send(err));
