import config from '../../config';
import { BasicCrudPromises, konsole } from '../../handlr/_all';
import { LocationService, TagsService } from './_all';

const _MappedCategories = {
    'adrenalin-and-extreme-sports': 'Adrenalin & Extreme Sports',
    'cultural': 'Cultural',
    'fun-and-games': 'Fun & Games',
    'nature-and-adventure': 'Nature & Adventure',
    'sightseeing': 'Sightseeing'
};

class Listings extends BasicCrudPromises {
    constructor() {
        super(config.connectionStrings.boredPass, 'listings');
    }

    mappedCategory(category) {
        return _MappedCategories[category] || 'Unknown Category';
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
        konsole.log('HERE', '>>>>>');
        let x1 = start[1];
        let x2 = end[1];
        let y1 = start[0];
        let y2 = end[0];
        let radians = Math.atan2(y1 - y2, x1 - x2);
        let compassReading = radians * (180 / Math.PI);
        return compassReading;
    }

    create(args) {
        return new Promise((resolve, reject) =>
            LocationService.geocodeAddress(args.data.address)
                .then(coordinates => {
                    args.data.geocodedAddress = coordinates;
                    args.data.location = coordinates.results && coordinates.results.length ? {
                        type: 'Point',
                        coordinates: [coordinates.results[0].geometry.location.lng, coordinates.results[0].geometry.location.lat],
                    } : null;
                    args.data.formatted_address = (coordinates.results && coordinates.results.length && coordinates.results[0].formatted_address) || 'Could not geocode';
                    return super.create(args);
                })
                .then(d => resolve(d))
                .catch(err => super.create(args)
                    .then(d => resolve(d))
                    .catch(err => {
                        konsole.error(err.toString());
                        reject(err.toString());
                    })
                )
        );
    }

    update(args) {
        return new Promise((resolve, reject) =>
            LocationService.geocodeAddress(args.data.address)
                .then(coordinates => {
                    args.data.geocodedAddress = coordinates;
                    args.data.location = coordinates.results && coordinates.results.length ? {
                        type: 'Point',
                        coordinates: [coordinates.results[0].geometry.location.lng, coordinates.results[0].geometry.location.lat]
                    } : null;
                    args.data.formatted_address = (coordinates.results && coordinates.results.length && coordinates.results[0].formatted_address) || 'Could not geocode';
                    return super.update(args);
                })
                .then(d => resolve(d))
                .catch(err => super.update(args)
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
                        unwind: '$tags'
                    },
                    {
                        group: {
                            _id: '$tags.name',
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
                .then(_ => TagsService.tagsPerCategory(
                    this.mappedCategory(args.category)
                ))
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

                    return args.coordinates ?
                        this.listingsWithProximity(listingArgs) :
                        this.defaultListings(listingArgs);
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
                        'tags.name': { $in: args.tags }
                    }
                });

            if (args.sort)
                pipeline.push({ sort: args.sort });
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
            let pipeline = [{
                geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(args.lng), parseFloat(args.lat)] },
                    maxDistance: 10 * 1000 * 1000, // 10,000km
                    spherical: true,
                    distanceField: 'distance',
                    query: (args.tags && args.tags.length && {
                        'tags.name': { $in: args.tags }
                    }) || null
                }
            }];

            if (args.sort)
                pipeline.push({ sort: args.sort });
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
            if (!listing)
                return resolve([]);

            let pipeline = [{
                geoNear: {
                    near: { type: 'Point', coordinates: listing.location.coordinates },
                    maxDistance: 1000 * 1000, // 1,000km
                    spherical: true,
                    limit: 3,
                    distanceField: 'distance',
                    query: {
                        '_id': { $ne: ListingsService.db.objectId(listing._id) },
                        'tags.name': { $in: listing.tags.map(t => t.name) }
                    }
                }
            }];

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
}

export const ListingsService = new Listings();