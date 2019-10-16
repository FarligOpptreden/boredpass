import { Utils, konsole } from "../../handlr";
import { ListingsService, TagsService } from ".";

class Search {
  find(args) {
    return new Promise((resolve, reject) => {
      let tags, listing, listings, recommended;
      Utils.chain()
        .then(_ => {
          if (!args.listing) return Utils.resolve();

          return ListingsService.findOne({ filter: args.listing });
        })
        .then(l => {
          listing = l;

          if (!args.tags || !args.tags.length) return Utils.resolve();

          return TagsService.findMany({
            filter: {
              _id: { $in: args.tags.map(t => TagsService.db.objectId(t)) }
            },
            sort: { name: 1 }
          });
        })
        .then(r => {
          tags = r || null;
          let pipeline = [];

          if (listing && listing.location && listing.location.coordinates)
            args.location = {
              lat: listing.location.coordinates[1],
              lon: listing.location.coordinates[0]
            };

          if (args.location) {
            let query = null;

            if (args.tags && args.tags.length) {
              query = query || {};
              query["tags._id"] = { $in: args.tags };
            }

            if (listing && listing._id) {
              query = query || {};
              query["_id"] = { $ne: TagsService.db.objectId(listing._id) };
            }

            pipeline.push({
              geoNear: {
                near: {
                  type: "Point",
                  coordinates: [args.location.lon, args.location.lat]
                },
                maxDistance: (args.distance && args.distance * 1000) || null,
                spherical: true,
                distanceField: "distance",
                query: query
              }
            });
            pipeline.push({
              sort: { distance: 1 }
            });
          } else {
            pipeline.push({
              filter:
                (args.tags &&
                  args.tags.length && {
                    "tags._id": { $in: args.tags }
                  }) ||
                null
            });
            pipeline.push({
              sort: { _id: -1 }
            });
          }

          pipeline.push({
            skip: args.skip || 0
          });
          pipeline.push({
            limit: args.limit || 12
          });

          return ListingsService.aggregate({
            pipeline: pipeline
          });
        })
        .then(r => {
          listings = r;

          if (!tags || !tags.length) return Utils.resolve();

          if (listings.length && listings.length === args.limit)
            return Utils.resolve();

          let tagCategories = [];
          tags.map(t => {
            tagCategories = tagCategories.concat(t.categories);
          });

          return TagsService.findMany({
            filter: {
              categories: {
                $in: tagCategories
              },
              _id: {
                $nin: tags.map(t => t._id)
              }
            }
          });
        })
        .then(r => {
          if (listings.length && listings.length === args.limit)
            return Utils.resolve();

          let pipeline = [];

          if (args.location)
            pipeline.push({
              geoNear: {
                near: {
                  type: "Point",
                  coordinates: [args.location.lon, args.location.lat]
                },
                maxDistance: null,
                spherical: true,
                distanceField: "distance",
                query:
                  (r &&
                    r.length && {
                      "tags._id": { $in: r.map(t => t._id.toString()) }
                    }) ||
                  null
              }
            });
          else if (r && r.length)
            pipeline.push({
              filter: {
                "tags._id": { $in: r.map(t => t._id.toString()) }
              }
            });

          konsole.error("3----------------------------");

          pipeline.push({
            sort: args.location ? { distance: 1 } : { _id: -1 }
          });
          pipeline.push({
            limit: 6
          });

          return ListingsService.aggregate({
            pipeline: pipeline
          });
        })
        .then(r => {
          recommended = r;

          resolve({
            tags: tags,
            location: args.location
              ? [args.location.lon, args.location.lat]
              : null,
            listing: listing,
            listings: listings,
            recommended: recommended,
            category: (tags && tags.map(t => t.categories[0])) || null
          });
        })
        .catch(err => reject(err.toString()));
    });
  }
}

export const SearchService = new Search();
