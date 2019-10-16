import config from "../../config";
import { BasicCrudPromises } from "../../handlr";
import moment from "moment";
import { RatingsService, UserActivityService } from ".";

const DATE_FORMAT = "DD MMM YYYY";
const FRIENDLY_LIMIT = 3;

class Users extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "users");
  }

  latestActivity(args) {
    return new Promise((resolve, _) =>
      UserActivityService.findMany(args).then(activities =>
        resolve(
          activities.map(a => ({
            _id: a._id,
            date:
              moment().diff(a._created, "month") > FRIENDLY_LIMIT
                ? moment(a._created).format(DATE_FORMAT)
                : moment(a._created).fromNow(),
            type: a.type,
            title: a.title,
            subTitle: a.subTitle,
            link: a.link
          }))
        )
      )
    );
  }

  ratingsAndReviews(args) {
    return new Promise(resolve => {
      RatingsService.findMany(args).then(ratings =>
        resolve(
          ratings.map(r => ({
            _id: r._id,
            date:
              moment().diff(r._created, "month") > FRIENDLY_LIMIT
                ? moment(r._created).format(DATE_FORMAT)
                : moment(r._created).fromNow(),
            rating: r.rating,
            review: r.review,
            meta: r.meta,
            user: r.user,
            listing: r.listing
          }))
        )
      );
    });
  }
}

export const UsersService = new Users();
