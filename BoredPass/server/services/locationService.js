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

                    LocationService.geocodeAddress(listing.address)
                        .then(coordinates => {
                            ListingsService.update({
                                filter: { _id: listing._id },
                                data: {
                                    geocodedAddress: coordinates,
                                    location: coordinates.results && coordinates.results.length ? {
                                        type: 'Point',
                                        coordinates: [coordinates.results[0].geometry.location.lat, coordinates.results[0].geometry.location.lng]
                                    } : null
                                }
                            });
                            doGeocode(data[++currIndex]);
                        })
                        .catch(err => {
                            console.log(err);
                            hasErrors = true;
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
}

export const LocationService = new Location();