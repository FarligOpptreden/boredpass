import { BasicCrudPromises } from "../../handlr";
import config from "../../config";
import { UserActivityService } from ".";
import { StringUtils } from "../utils";

class Followers extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "followers");
  }

  async create(args) {
    try {
      const following = await super.create(args);
      const activityType = UserActivityService.types.startFollowing;
      await UserActivityService.create({
        data: {
          type: activityType.key,
          title: activityType.display,
          subTitle: following.target.name,
          link: `/user/${following.target._id}/${StringUtils.makeUrlFriendly(
            following.target.name
          )}`,
          user: following.follower
        }
      });
      return following;
    } catch (err) {
      throw err;
    }
  }

  async delete(args) {
    try {
      await super.delete(args);
      const activityType = UserActivityService.types.stopFollowing;
      await UserActivityService.create({
        data: {
          type: activityType.key,
          title: activityType.display,
          subTitle: args.target.name,
          link: `/user/${args.target._id}/${StringUtils.makeUrlFriendly(
            args.target.name
          )}`,
          user: args.follower
        }
      });
    } catch (err) {
      throw err;
    }
  }
}

export const FollowersService = new Followers();
