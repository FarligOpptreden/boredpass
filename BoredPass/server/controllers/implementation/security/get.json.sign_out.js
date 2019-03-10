import { SecurityService } from "../../../services";

export const get_json_sign_out = (req, res) =>
  SecurityService.signOut(req, res)
    .then(r => res.send(r))
    .catch(r => res.send(r));
