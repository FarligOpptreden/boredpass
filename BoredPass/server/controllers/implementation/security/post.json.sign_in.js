import { SecurityService } from "../../../services";

export const post_json_sign_in = async (req, res) => {
  try {
    const r = await SecurityService.signIn(req.body, res);
    res.send(r);
  } catch (err) {
    res.send(err);
  }
};
