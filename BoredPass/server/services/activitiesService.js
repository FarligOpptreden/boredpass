import config from "../../config";
import { BasicCrudPromises } from "../../handlr";

class Activities extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "activities");
  }
}

export const ActivitiesService = new Activities();
