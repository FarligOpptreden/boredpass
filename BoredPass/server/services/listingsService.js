import config from '../../config';
import { BasicCrud, konsole } from '../../handlr/_all';
import { LocationService, TagsService } from './_all';

const _MappedCategories = {
    'adrenalin-and-extreme-sports': 'Adrenalin & Extreme Sports',
    'cultural': 'Cultural',
    'fun-and-games': 'Fun & Games',
    'nature-and-adventure': 'Nature & Adventure',
    'sightseeing': 'Sightseeing'
};

class Listings extends BasicCrud {
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

    create(args, callback) {
        LocationService.geocodeAddress(args.data.address)
            .then(coordinates => {
                args.data.geocodedAddress = coordinates;
                args.data.location = coordinates.results && coordinates.results.length ? {
                    type: 'Point',
                    coordinates: [coordinates.results[0].geometry.location.lng, coordinates.results[0].geometry.location.lat],
                } : null;
                args.data.formatted_address = (coordinates.results && coordinates.results.length && coordinates.results[0].formatted_address) || 'Could not geocode';
                super.create(args, callback);
            })
            .catch(err => super.create(args, callback));
    }

    update(args, callback) {
        LocationService.geocodeAddress(args.data.address)
            .then(coordinates => {
                args.data.geocodedAddress = coordinates;
                args.data.location = coordinates.results && coordinates.results.length ? {
                    type: 'Point',
                    coordinates: [coordinates.results[0].geometry.location.lng, coordinates.results[0].geometry.location.lat]
                } : null;
                args.data.formatted_address = (coordinates.results && coordinates.results.length && coordinates.results[0].formatted_address) || 'Could not geocode';
                super.update(args, callback);
            })
            .catch(err => super.update(args, callback));
    }

    statistics(callback) {
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
        }, callback);
    }

    listingsByCategory(args) {
        konsole.log(args, ':::::::::::::::::::::::::::');
        return new Promise((resolve, reject) => {
            TagsService.tagsPerCategory(this.mappedCategory(args.category))
                .then(tags => {
                    ListingsService.findMany({
                        filter: { 'tags.name': { $in: tags.map(t => t.name) } },
                        sort: { _created: -1 },
                        limit: parseInt(args.limit.toString(), 10),
                        skip: parseInt(args.skip.toString(), 10)
                    }, listings => resolve(listings));
                })
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

            pipeline.push({
                sort: {
                    _created: -1
                }
            });

            if (args.limit)
                pipeline.push({
                    limit: args.limit
                });

            ListingsService.aggregate({
                pipeline: pipeline
            }, listings => resolve(listings))
        });
    }

    listingsWithProximity(args) {
        return new Promise((resolve, reject) => {
            let pipeline = [{
                geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(args.lng), parseFloat(args.lat)] },
                    maxDistance: 10 * 1000 * 1000, // 10,000km
                    spherical: true,
                    distanceField: 'distance'
                }
            }];

            if (args.tags && args.tags.length)
                pipeline.push({
                    filter: {
                        'tags.name': { $in: args.tags }
                    }
                });

            pipeline.push({
                sort: {
                    _created: -1
                }
            });

            if (args.limit)
                pipeline.push({
                    limit: args.limit
                });

            ListingsService.aggregate({
                pipeline: pipeline
            }, listings => resolve(listings))
        });
    }
}

export const ListingsService = new Listings();