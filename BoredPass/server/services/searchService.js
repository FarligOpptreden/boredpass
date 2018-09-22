import config from '../../config';
import { konsole, Utils } from '../../handlr/_all';
import { ListingsService, TagsService } from './_all';

class Search {

    find(args) {
        return new Promise((resolve, reject) => {
            let tags, listings, recommended;
            Utils.chain()
                .then(_ => {
                    if (!args.tags || !args.tags.length)
                        return Utils.resolve();

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

                    if (args.location) {
                        pipeline.push({
                            geoNear: {
                                near: { type: 'Point', coordinates: [args.location.lon, args.location.lat] },
                                maxDistance: (args.distance && args.distance * 1000) || null,
                                spherical: true,
                                distanceField: 'distance',
                                query: (args.tags && args.tags.length && {
                                    'tags._id': { $in: args.tags }
                                }) || null
                            }
                        });
                        pipeline.push({
                            sort: { distance: 1 }
                        });
                    }
                    else {
                        pipeline.push({
                            filter: (args.tags && args.tags.length && {
                                'tags._id': { $in: args.tags }
                            }) || null
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

                    let pipeline = [{
                        geoNear: {
                            near: { type: 'Point', coordinates: [args.location.lon, args.location.lat] },
                            maxDistance: null,
                            spherical: true,
                            distanceField: 'distance',
                            query: (r && r.length && {
                                'tags._id': { $in: r.map(t => t._id.toString()) }
                            }) || null
                        }
                    }, {
                        sort: { distance: 1 }
                    }, {
                        limit: 6
                    }];

                    konsole.log(pipeline);

                    return ListingsService.aggregate({
                        pipeline: pipeline
                    });
                })
                .then(r => {
                    recommended = r;

                    resolve({
                        tags: tags,
                        listings: listings,
                        recommended: recommended
                    });
                })
                .catch(err => {
                    reject(err.toString());
                });
        });
    }
}

export const SearchService = new Search();