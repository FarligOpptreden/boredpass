import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";

let BADGES_CACHE = null;

class Badges extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "badges");
  }

  findAll() {
    return new Promise((resolve, reject) => {
      if (BADGES_CACHE && BADGES_CACHE.length) return resolve(BADGES_CACHE);

      BadgesService.findMany({})
        .then(d => {
          BADGES_CACHE = d;
          resolve(d);
        })
        .catch(err => {
          konsole.error(err);
          reject(err);
        });
    });
  }
}

export const BadgesService = new Badges();
