import config from "../../config";
import { BasicCrudPromises } from "../../handlr";

class Facilities extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "facilities");
  }
}

export const FacilitiesService = new Facilities();
