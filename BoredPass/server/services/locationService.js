import config from '../../config';
import { ListingsService } from './_all';
import fetch from 'node-fetch';

class Location {
    bulkUpdate(args) {
        return new Promise((resolve, reject) =>
            ListingsService.findMany({}, function (data) {
                let hasErrors = false;
                let currIndex = 0;
                let doGeocode = listing => {
                    if (!listing)
                        return hasErrors ? reject('Could not geocode!') : resolve(data.length);

                    ListingsService.update({
                        filter: { _id: listing._id },
                        data: {
                            address: listing.address
                        }
                    }, function () {
                        doGeocode(data[++currIndex]);
                    });
                };
                doGeocode(data[0]);
            })
        );
    }

    geocodeAddress(address) {
        return new Promise((resolve, reject) =>
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.keys.google}`)
                .then(res => res.json())
                .then(json => resolve(json))
                .catch(err => reject(err))
        );
    }

    search(args) {
        let url = config.endpoints.locationSearch
            .replace('{token}', config.keys.locationIq)
            .replace('{search}', args.search);

        return new Promise((resolve, reject) =>
            fetch(url)
                .then(res => res.json())
                .then(json => resolve(json))
                .catch(err => reject(err))
        );
    }
}

export const LocationService = new Location();