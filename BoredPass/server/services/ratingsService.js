import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";

class Ratings extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "ratings");
  }
}

export const RatingsService = new Ratings();
