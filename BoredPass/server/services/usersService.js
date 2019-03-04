import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";
import moment from "moment";

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

  ratingsAndReviews() {
    return new Promise((resolve, _) => {
      resolve([
        {
          date: (_ => {
            let d = moment("2019-02-05", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Airboat Afrika",
          link:
            "/listings/5b20ed2d6d35ad10741cbc21/airboat-afrika/#/ratings/RATING_ID",
          icon: "/content/jpg/8d50e1e49f4b30d2b040ff5139cdbaaa",
          rating: 5,
          review: "Awesome experience, would do it again soon!"
        },
        {
          date: (_ => {
            let d = moment("2019-02-01", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Classique Aviation",
          link:
            "/listings/5b20e80a6d35ad10741cbc20/classique-aviation/#/ratings/RATING_ID",
          icon: "/content/png/2c9f2ecf389cdda206fb78394048c96c",
          rating: 4
        },
        {
          date: (_ => {
            let d = moment("2018-12-16", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "The Harvard Club of South Africa",
          link:
            "/listings/5b20de046d35ad10741cbc1d/the-harvard-club-of-south-africa/#/ratings/RATING_ID",
          icon: "/content/jpg/21200aa02c94830ee75b65df8b093154",
          rating: 2
        },
        {
          date: (_ => {
            let d = moment("2018-12-03", "YYYY-MM-DD");
            return moment().diff(d, "month") > FRIENDLY_LIMIT
              ? d.format(DATE_FORMAT)
              : d.fromNow();
          })(),
          title: "Aquila Private Game Reserve",
          link:
            "/listings/5b21623b6d35ad10741cbc2e/aquila-private-game-reserve/#/ratings/RATING_ID",
          icon: "/content/jpg/21200aa02c94830ee75b65df8b093154",
          rating: 4,
          review: "Professional establishment and loads of animals. Had a blast!"
        }
      ]);
    });
  }
}

export const UsersService = new Users();
