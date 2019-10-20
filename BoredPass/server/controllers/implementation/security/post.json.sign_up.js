import { SecurityService } from "../../../services";

export const post_json_sign_up = async (req, res) => {
  try {
    const r = await SecurityService.signUp(req.body);
    res.send(r);
  } catch (err) {
    res.send(err);
  }
};
