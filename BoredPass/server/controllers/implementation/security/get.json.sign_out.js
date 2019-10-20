import { SecurityService } from "../../../services";

export const get_json_sign_out = async (req, res) => {
  try {
    const r = await SecurityService.signOut(req, res);
    res.send(r);
  } catch (err) {
    res.send(err);
  }
};
