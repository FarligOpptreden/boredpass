import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";
import moment from "moment";
import {
  RatingsService,
  UserActivityService,
  ListingsService,
  FollowersService
} from ".";
import { StringUtils } from "../utils";

const DATE_FORMAT = "DD MMM YYYY";
const FRIENDLY_LIMIT = 3;

class Users extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "users");
  }

  async latestActivity(args) {
    const activities = await UserActivityService.findMany(args);
    return activities.map(a => ({
      _id: a._id,
      date:
        moment().diff(a._created, "month") > FRIENDLY_LIMIT
          ? moment(a._created).format(DATE_FORMAT)
          : moment(a._created).fromNow(),
      type: a.type,
      title: a.title,
      subTitle: a.subTitle,
      link: a.link
    }));
  }

  async ratingsAndReviews(args) {
    const ratings = await RatingsService.findMany(args);
    return ratings.map(r => ({
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
    }));
  }

  async claimedListings(args) {
    const listings = await ListingsService.findMany(args);
    return listings.map(l => ({
      _id: l._id,
      name: l.name,
      date:
        moment().diff(l.claim.claimedOn, "month") > FRIENDLY_LIMIT
          ? moment(l.claim.claimedOn).format(DATE_FORMAT)
          : moment(l.claim.claimedOn).fromNow(),
      link: `/listings/${l._id}/${StringUtils.makeUrlFriendly(l.name)}`,
      icon:
        l.logo.location ||
        `/content/${l.logo.fileType.replace(".", "")}/${l.logo.fileId}`
    }));
  }

  async followers(userId) {
    const following = await FollowersService.findMany({
      filter: {
        "target._id": FollowersService.db.objectId(userId)
      },
      sort: {
        "follower.name": 1
      }
    });
    return following.map(f => ({
      follower: f.follower,
      target: f.target,
      date:
        moment().diff(f._created, "month") > FRIENDLY_LIMIT
          ? moment(f._created).format(DATE_FORMAT)
          : moment(f._created).fromNow(),
      link: `/user/${f.follower._id}/${StringUtils.makeUrlFriendly(
        f.follower.name
      )}`
    }));
  }

  async following(userId) {
    const following = await FollowersService.findMany({
      filter: {
        "follower._id": FollowersService.db.objectId(userId)
      },
      sort: {
        "target.name": 1
      }
    });
    return following.map(f => ({
      follower: f.follower,
      target: f.target,
      date:
        moment().diff(f._created, "month") > FRIENDLY_LIMIT
          ? moment(f._created).format(DATE_FORMAT)
          : moment(f._created).fromNow(),
      link: `/user/${f.target._id}/${StringUtils.makeUrlFriendly(
        f.target.name
      )}`
    }));
  }
}

export const UsersService = new Users();
