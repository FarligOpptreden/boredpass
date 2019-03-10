import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";

const TYPES = {
  create_listing: { key: "create-listing", display: "Loading a listing" }
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
