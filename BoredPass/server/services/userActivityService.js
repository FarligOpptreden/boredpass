import config from "../../config";
import { BasicCrudPromises } from "../../handlr";

const TYPES = {
  create_listing: { key: "create-listing", display: "Loading a listing" },
  rating: { key: "rating", display: "Rated a listing" },
  ratingAndReview: { key: "rating-and-review", display: "Reviewed a listing" },
  registration: { key: "registration", display: "Joined BoredPass" },
  startFollowing: { key: "start-following", display: "Started following" },
  stopFollowing: { key: "stop-following", display: "Stopped following" }
};

class UserActivity extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "user_activity");
  }

  get types() {
    return TYPES;
  }
}

export const UserActivityService = new UserActivity();
