import config from "../../config";
import { BasicCrudPromises } from "../../handlr";
import { UserActivityService } from ".";
import { StringUtils } from "../utils";

class Ratings extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "ratings");
  }

  create(args) {
    return new Promise((resolve, reject) => {
      let _rating;
      super
        .create(args)
        .then(rating => {
          _rating = rating;
          let activityType = rating.review
            ? UserActivityService.types.ratingAndReview
            : UserActivityService.types.rating;
          return UserActivityService.create({
            data: {
              type: activityType.key,
              title: activityType.display,
              subTitle: rating.listing.name,
              link: `/listings/${
                rating.listing._id
              }/${StringUtils.makeUrlFriendly(rating.listing.name)}/#/ratings/${
                rating._id
              }`,
              user: rating.user
            }
          });
        })
        .then(_ => resolve(_rating))
        .catch(err => reject(err));
    });
  }
}

export const RatingsService = new Ratings();
