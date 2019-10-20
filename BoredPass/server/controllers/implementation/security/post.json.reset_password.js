import { SecurityService } from "../../../services";
import { konsole } from "../../../../handlr";

export const post_json_reset_password = async (req, res) => {
  try {
    const response = await SecurityService.resetPassword(req.body);
    res.json(response);
  } catch (err) {
    konsole.error(err);
    res.json(err.message ? err : { success: false, message: err });
  }
};
