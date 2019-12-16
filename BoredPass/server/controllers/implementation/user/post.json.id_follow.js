import { UsersService, FollowersService } from "../../../services";
import config from "../../../../config";

export const post_json_id_follow = async (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).send({
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      req: req
    });

  try {
    const target = await UsersService.findOne({
      filter: { _id: UsersService.db.objectId(req.params.id) }
    });
    const follower = req.authentication.user;
    await FollowersService.create({
      data: {
        target,
        follower
      }
    });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`
    });
  }
};
