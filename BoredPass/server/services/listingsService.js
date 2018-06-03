import config from '../../config';
import { BasicCrud } from '../../handlr/_all';
import { LocationService } from './_all';

class Listings extends BasicCrud {
    constructor() {
        super(config.connectionStrings.boredPass, 'listings');
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

    defaultListings() {
        return new Promise((resolve, reject) =>
            ListingsService.findMany({
                sort: { _created: -1 }
            }, (listings) => resolve({ listings: listings }))
        );
    }

    listingsWithProximity(args) {
        return new Promise((resolve, reject) =>
            ListingsService.aggregate({
                pipeline: [
                    {
                        geoNear: {
                            near: { type: 'Point', coordinates: [parseFloat(args.lng), parseFloat(args.lat)] },
                            maxDistance: 10 * 1000 * 1000, // 10,000km
                            spherical: true,
                            distanceField: 'distance'
                        }
                    },
                    {
                        sort: {
                            _created: -1
                        }
                    }
                ]
            }, listings => resolve({ listings: listings }))
        );
    }
}

export const ListingsService = new Listings();