import { SecurityService } from "../../../services";
import { konsole } from "../../../../handlr";

export const post_json_forgot_password_request = async (req, res) => {
  try {
    const response = await SecurityService.initiatePasswordReset({
      email: req.body.email
    });
    res.json(response);
  } catch (err) {
    konsole.error(err);
    res.json(err.message ? err : { success: false, message: err });
  }
};
