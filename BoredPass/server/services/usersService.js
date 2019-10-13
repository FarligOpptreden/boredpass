import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";
import moment from "moment";
import { RatingsService } from ".";

const DATE_FORMAT = "DD MMM YYYY";
const FRIENDLY_LIMIT = 3;

class Users extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "users");
  }

  latestActivity() {
    return new Promise((resolve, _) => {
      resolve([
        {
          type: "create-listing",
          date: (_ => {
            let d = moment("2019-02-05", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Loaded a listing",
          subTitle: "Teresa Decinti Fine Art Gallery",
          link:
            "/listings/5b2d13db2bcbce0aa8cd4cc1/teresa-decinti-fine-art-gallery"
        },
        {
          type: "rating-and-review",
          date: (_ => {
            let d = moment("2019-02-01", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Reviewed a listing",
          subTitle: "Hide-out Archery",
          link:
            "/listings/5b27ac376d35ad10741cbc3b/hide-out-archery/#/ratings/RATING_ID"
        },
        {
          type: "rating",
          date: (_ => {
            let d = moment("2019-01-24", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Rated a listing",
          subTitle: "Airboat Afrika",
          link:
            "/listings/5b20ed2d6d35ad10741cbc21/airboat-afrika/#/ratings/RATING_ID"
        },
        {
          type: "badge",
          date: (_ => {
            let d = moment("2018-10-01", "YYYY-MM-DD");
            konsole.log(moment().diff(d, "month"), "###");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Earned a Badge",
          subTitle: "Recruit"
        },
        {
          type: "registration",
          date: (_ => {
            let d = moment("2018-10-01", "YYYY-MM-DD");
            konsole.log(moment().diff(d, "month"), "###");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Joined BoredPass"
        }
      ]);
    });
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
