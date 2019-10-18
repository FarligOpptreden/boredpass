import config from "../../config";
import { BasicCrudPromises, konsole, Utils } from "../../handlr";
import {
  LocationService,
  TagsService,
  UserActivityService,
  EmailsService
} from ".";
import { StringUtils } from "../utils";
import { v4 as uuid } from "uuid";
import moment from "moment";

const _MappedCategories = {
  "adrenalin-and-extreme-sports": "Adrenalin & Extreme Sports",
  cultural: "Cultural",
  "fun-and-games": "Fun & Games",
  "nature-and-adventure": "Nature & Adventure",
  sightseeing: "Sightseeing"
};

class Listings extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "listings");
  }

  mappedCategory(category) {
    return _MappedCategories[category] || "Unknown Category";
  }

  unmappedCategories(category) {
    let newObj = {};
    Object.keys(_MappedCategories)
      .filter(k => k !== category)
      .map(k => {
        newObj[k] = _MappedCategories[k];
      });
    return newObj;
  }

  calculateBearing(start, end) {
    let x1 = start[1];
    let x2 = end[1];
    let y1 = start[0];
    let y2 = end[0];
    let radians = Math.atan2(y1 - y2, x1 - x2);
    let compassReading = radians * (180 / Math.PI);
    return compassReading;
  }

  create(args) {
    return new Promise((resolve, reject) => {
      let _listing;
      args.data.author = {
        _id: args.user._id,
        name: args.user.name,
        profile_pictures: args.user.profile_pictures
      };
      LocationService.geocodeAddress(args.data.address)
        .then(coordinates => {
          args.data.geocodedAddress = coordinates;
          args.data.location =
            coordinates.results && coordinates.results.length
              ? {
                  type: "Point",
                  coordinates: [
                    coordinates.results[0].geometry.location.lng,
                    coordinates.results[0].geometry.location.lat
                  ]
                }
              : null;
          args.data.formatted_address =
            (coordinates.results &&
              coordinates.results.length &&
              coordinates.results[0].formatted_address) ||
            "Could not geocode";
          return super.create(args);
        })
        .then(listing => {
          _listing = listing;
          let activityType = UserActivityService.types.create_listing;
          return UserActivityService.create({
            data: {
              type: activityType.key,
              title: activityType.display,
              subTitle: listing.name,
              link: `/listings/${listing._id}/${StringUtils.makeUrlFriendly(
                listing.name
              )}`,
              user: listing.author
            }
          });
        })
        .then(_ => resolve(_listing))
        .catch(err => {
          konsole.error(err.toString());
          super
            .create(args)
            .then(listing => {
              _listing = listing;
              let activityType = UserActivityService.types.create_listing;
              return UserActivityService.create({
                data: {
                  type: activityType.key,
                  title: activityType.display,
                  subTitle: listing.name,
                  link: `/listings/${listing._id}/${StringUtils.makeUrlFriendly(
                    listing.name
                  )}`,
                  user: listing.author
                }
              });
            })
            .then(_ => resolve(_listing))
            .catch(err => {
              konsole.error(err.toString());
              reject(err.toString());
            });
        });
    });
  }

  update(args) {
    return new Promise((resolve, reject) =>
      LocationService.geocodeAddress(args.data.address)
        .then(coordinates => {
          args.data.geocodedAddress = coordinates;
          args.data.location =
            coordinates.results && coordinates.results.length
              ? {
                  type: "Point",
                  coordinates: [
                    coordinates.results[0].geometry.location.lng,
                    coordinates.results[0].geometry.location.lat
                  ]
                }
              : null;
          args.data.formatted_address =
            (coordinates.results &&
              coordinates.results.length &&
              coordinates.results[0].formatted_address) ||
            "Could not geocode";
          return super.update(args);
        })
        .then(d => resolve(d))
        .catch(err =>
          super
            .update(args)
            .then(d => resolve(d))
            .catch(err => {
              konsole.error(err.toString());
              reject(err.toString());
            })
        )
    );
  }

  statistics() {
    return new Promise((resolve, reject) =>
      this.aggregate({
        pipeline: [
          {
            unwind: "$tags"
          },
          {
            group: {
              _id: "$tags.name",
              count: { $sum: 1 }
            }
          },
          {
            sort: {
              _id: 1
            }
          }
        ]
      })
        .then(d => resolve(d))
        .catch(err => {
          konsole.error(err.toString());
          reject(err.toString());
        })
    );
  }

  listingsByCategory(args) {
    return new Promise((resolve, reject) => {
      Promise.resolve()
        .then(_ =>
          TagsService.tagsPerCategory(this.mappedCategory(args.category))
        )
        .then(tags => {
          let listingArgs = {
            tags: tags.map(t => t.name),
            sort: { _created: -1 },
            skip: parseInt(args.skip.toString(), 10),
            limit: parseInt(args.limit.toString(), 10)
          };

          if (args.coordinates) {
            listingArgs.lat = args.coordinates.lat;
            listingArgs.lng = args.coordinates.lng;
          }

          return args.coordinates
            ? this.listingsWithProximity(listingArgs)
            : this.defaultListings(listingArgs);
        })
        .then(listings => resolve(listings))
        .catch(err => reject(err));
    });
  }

  defaultListings(args) {
    return new Promise((resolve, reject) => {
      let pipeline = [];

      if (args.tags && args.tags.length)
        pipeline.push({
          filter: {
            "tags.name": { $in: args.tags }
          }
        });

      if (args.sort) pipeline.push({ sort: args.sort });
      else
        pipeline.push({
          sort: {
            _created: -1
          }
        });

      if (args.skip)
        pipeline.push({
          skip: args.skip
        });

      if (args.limit)
        pipeline.push({
          limit: args.limit
        });

      ListingsService.aggregate({
        pipeline: pipeline
      })
        .then(listings => resolve(listings))
        .catch(err => {
          konsole.error(err.toString());
          reject(err.toString());
        });
    });
  }

  listingsWithProximity(args) {
    return new Promise((resolve, reject) => {
      let pipeline = [
        {
          geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(args.lng), parseFloat(args.lat)]
            },
            maxDistance: 10 * 1000 * 1000, // 10,000km
            spherical: true,
            distanceField: "distance",
            query:
              (args.tags &&
                args.tags.length && {
                  "tags.name": { $in: args.tags }
                }) ||
              null
          }
        }
      ];

      if (args.sort) pipeline.push({ sort: args.sort });
      else
        pipeline.push({
          sort: {
            _created: -1
          }
        });

      if (args.skip)
        pipeline.push({
          skip: args.skip
        });

      if (args.limit)
        pipeline.push({
          limit: args.limit
        });

      ListingsService.aggregate({
        pipeline: pipeline
      })
        .then(listings => resolve(listings))
        .catch(err => {
          konsole.error(err.toString());
          reject(err.toString());
        });
    });
  }

  relatedListings(listing) {
    return new Promise((resolve, reject) => {
      if (!listing) return resolve([]);

      let pipeline = [];

      if (listing.location && listing.location.coordinates)
        pipeline.push({
          geoNear: {
            near: { type: "Point", coordinates: listing.location.coordinates },
            maxDistance: 1000 * 1000, // 1,000km
            spherical: true,
            limit: 3,
            distanceField: "distance",
            query: {
              _id: { $ne: ListingsService.db.objectId(listing._id) },
              "tags.name": { $in: listing.tags.map(t => t.name) }
            }
          }
        });
      else
        pipeline.push({
          filter: {
            _id: { $ne: ListingsService.db.objectId(listing._id) },
            "tags.name": { $in: listing.tags.map(t => t.name) }
          }
        });

      pipeline.push(
        listing.location && listing.location.coordinates
          ? {
              sort: { distance: 1 }
            }
          : {
              sort: { name: 1 }
            }
      );

      if (!listing.location || !listing.location.coordinates)
        pipeline.push({
          limit: 3
        });

      ListingsService.aggregate({
        pipeline: pipeline
      })
        .then(listings => resolve(listings))
        .catch(err => {
          konsole.error(err.toString());
          reject(err.toString());
        });
    });
  }

  initiateClaim(args) {
    return new Promise((resolve, reject) => {
      let claimToken = uuid();
      let _listing;

      this.findOne({
        filter: { _id: args.listing_id }
      })
        .then(listing => {
          if (!listing)
            return Utils.reject(
              "Could not find the listing to initiate the claim"
            );

          _listing = listing;
          return Utils.resolve(listing);
        })
        .then(listing =>
          super.update({
            filter: { _id: listing._id },
            data: {
              claim: {
                token: claimToken,
                initiatedOn: moment().toDate(),
                expiresOn: moment()
                  .add(24, "hours")
                  .toDate(),
                status: "initiated",
                user: {
                  _id: args.user._id.toString(),
                  name: args.user.name,
                  profile_pictures: args.user.profile_pictures
                }
              }
            }
          })
        )
        .then(_ =>
          EmailsService.send({
            subject: "BoredPass Listing Claim Verification",
            recipients: [{ name: _listing.name, email: _listing.email }],
            template: {
              view: "email_templates/claim_initiation",
              props: {
                title: `Claim Listing "${_listing.name}"`,
                claimLink: config.endpoints.claimVerification
                  .replace("{id}", _listing._id)
                  .replace("{token}", claimToken),
                listing: _listing
              }
            }
          })
        )
        .then(_ => resolve({ success: true, email: _listing.email }))
        .catch(err => {
          konsole.error(err.toString());
          reject(err);
        });
    });
  }

  verifyClaim(args) {
    return new Promise((resolve, reject) => {
      let _listing;

      ListingsService.findOne({
        filter: {
          _id: ListingsService.db.objectId(args.listing_id),
          "claim.token": args.token,
          "claim.status": "initiated"
        }
      })
        .then(listing => {
          if (!listing)
            return Utils.reject({
              success: true,
              message:
                "Could not find the listing to claim. Please try claiming it again to receive a new verification email."
            });

          if (moment(listing.expiresOn) < moment())
            return Utils.reject({
              success: true,
              message:
                "The claim to this listing has already expired. Please try claiming it again and actioning the verification email withing 24 hours."
            });

          return Utils.resolve(listing);
        })
        .then(listing => {
          _listing = listing;
          super.update({
            filter: { _id: ListingsService.db.objectId(args.listing_id) },
            data: {
              "claim.expiresOn": null,
              "claim.claimedOn": moment().toDate(),
              "claim.status": "verified",
              "claim.token": null
            }
          });
        })
        .then(listing => resolve({ success: true, listing: _listing }))
        .catch(err => {
          if (err.success)
            return resolve({ success: false, message: err.message });

          konsole.error(err.toString());
          reject(err);
        });
    });
  }
}

export const ListingsService = new Listings();
