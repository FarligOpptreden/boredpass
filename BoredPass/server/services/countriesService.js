import config from "../../config";
import { BasicCrudPromises } from "../../handlr";

class Countries extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "countries");
  }
}

export const CountriesService = new Countries();
