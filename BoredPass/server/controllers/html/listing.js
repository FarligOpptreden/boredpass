import config from '../../../config';
import { Controller, konsole } from '../../../handlr/_all';
import { ListingsService, ActivitiesService, FacilitiesService, TagsService, CountriesService } from '../../services/_all';
import { StringUtils } from '../../utils';
import marked from 'marked';

export default new Controller('/listings')
    .handle({ route: '/duplicates/:search', method: 'get', produces: 'json' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.addListing)
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });

        Promise.resolve()
            .then(_ => ListingsService.findMany({
                filter: { name: { $regex: `^${req.params.search}.*`, $options: 'i' } },
                data: { name: 1, formatted_address: 1 }
            }))
            .then(duplicates =>
                res.json({
                    success: true,
                    listings: duplicates
                })
            )
            .catch(err => res.status(500).json({
                success: false,
                message: `Something unexpected happened: ${err}`
            }));
    })
    .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.addListing)
            return res.status(403).render('error', {
                error: {
                    status: 403,
                    stack: config.app.debug && err.stack
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?',
                categories: req.listing_categories
            });

        FacilitiesService.findMany({ sort: { name: 1 } })
            .then(facilities =>
                res.render('add_listing', {
                    authentication: req.authentication,
                    title: 'Add Listing - BoredPass',
                    moment: require('moment'),
                    facilities: facilities,
                    categories: req.listing_categories
                })
            )
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    })
    .handle({ route: '/add/wizard', method: 'get', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.addListing)
            return res.status(403).render('error', {
                error: {
                    status: 403,
                    stack: config.app.debug && err.stack
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?'
            });

        let facilities, countries;

        Promise.resolve()
            .then(_ => FacilitiesService.findMany({ sort: { name: 1 } }))
            .then(r => {
                facilities = r;
                return CountriesService.findMany({ sort: { name: 1 } });
            })
            .then(r => {
                countries = r;
                res.render('partials/add_listing_wizard', {
                    moment: require('moment'),
                    countries: countries,
                    facilities: facilities
                })
            })
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`
            }));
    })
    .handle({ route: '/add', method: 'post', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.addExperience)
            return res.status(403).render('error', {
                error: {
                    status: 403,
                    stack: config.app.debug && err.stack
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?',
                categories: req.listing_categories
            });

        ListingsService.create({ data: req.body })
            .then(result => ListingsService.findOne({
                filter: { _id: result._id }
            }))
            .then(result => res.render('partials/add_listing_result', {
                success: result && result._id && true,
                isModerator: (req.authentication && req.authentication.isAuthenticated && req.authentication.user.permissions && req.authentication.user.permissions.moderateListing && true) || false,
                id: result._id && result._id,
                listing: result,
                makeUrlFriendly: StringUtils.makeUrlFriendly,
                marked: marked,
                moment: require('moment'),
                categories: req.listing_categories
            }))
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    })
    .handle({ route: '/:id/added', method: 'get', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.addListing)
            return res.status(403).render('error', {
                error: {
                    status: 403,
                    stack: config.app.debug && err.stack
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?',
                categories: req.listing_categories
            });

        ListingsService.findOne({ filter: { _id: req.params.id } })
            .then(listing =>
                res.render('add_listing_done', {
                    authentication: req.authentication,
                    title: 'Add Listing - BoredPass',
                    moment: require('moment'),
                    listing: listing,
                    categories: req.listing_categories
                })
            )
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    })
    .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
        let _listing = null, _activities = null;

        Promise.resolve()
            .then(_ => ListingsService.findOne({ filter: req.params.id }))
            .then(listing => {
                _listing = listing;
                return ActivitiesService.findMany({ filter: { listing_id: listing._id }, sort: { name: 1 } });
            })
            .then(activities => {
                _activities = activities;
                return ListingsService.relatedListings(_listing);
            })
            .then(related =>
                res.render('listing', {
                    authentication: req.authentication,
                    title: _listing.name + ' - BoredPass',
                    moment: require('moment'),
                    marked: marked,
                    listing: _listing,
                    activities: _activities,
                    related: related,
                    makeUrlFriendly: StringUtils.makeUrlFriendly,
                    categories: req.listing_categories
                })
            )
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    })
    .handle({ route: '/:id/edit', method: 'get', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.editListing)
            return res.status(403).render('error', {
                error: {
                    status: 403,
                    stack: config.app.debug && err.stack
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?',
                categories: req.listing_categories
            });

        let _listing, _facilities, _activities;

        let getFacilities = listing => new Promise((resolve, reject) =>
            FacilitiesService.findMany({ sort: { name: 1 } })
                .then(facilities => {
                    listing.facilities && listing.facilities.length && listing.facilities.map(facility =>
                        facilities.map(f => {
                            if (f && facility && f._id.toString() === facility._id.toString())
                                f.selected = true;
                        })
                    );
                    _facilities = facilities;
                    resolve(facilities);
                })
        );

        let getActivities = listing => new Promise((resolve, reject) =>
            ActivitiesService.findMany({
                filter: { listing_id: listing._id },
                sort: { name: 1 }
            })
                .then(activities => {
                    _activities = activities;
                    resolve(activities);
                })
        );

        Promise.resolve()
            .then(_ => ListingsService.findOne({ filter: req.params.id }))
            .then(listing => {
                _listing = listing;
                return Promise.all([getFacilities(listing), getActivities(listing)]);
            })
            .then(_ =>
                res.render('listing_edit', {
                    authentication: req.authentication,
                    title: _listing.name + ' - BoredPass',
                    moment: require('moment'),
                    marked: marked,
                    listing: _listing,
                    activities: _activities,
                    facilities: _facilities,
                    categories: req.listing_categories
                })
            )
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    })
    .handle({ route: '/:id/edit', method: 'put', produces: 'json' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.editListing)
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });

        let listing = req.body;
        ListingsService.update({
            filter: req.params.id,
            data: listing
        })
            .then(result =>
                res.json({
                    success: result && true,
                    id: result && req.params.id
                })
            )
            .catch(err => res.status(500).json({
                success: false,
                message: `Something unexpected happened: ${err}`
            }));
    })
    .handle({ route: '/:id/delete', method: 'delete', produces: 'json' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated || !req.authentication.user.permissions || !req.authentication.user.permissions.deleteListing)
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });

        Promise.resolve()
            .then(_ => ActivitiesService.deleteMany({ filter: { listing_id: ActivitiesService.db.objectId(req.params.id) } }))
            .then(r => ListingsService.delete({ filter: req.params.id }))
            .then(r => res.json(r))
            .catch(err => res.status(500).json({
                success: false,
                message: `Something unexpected happened: ${err}`
            }));
    })
    .handle({ route: '/:id/:name', method: 'get', produces: 'html' }, (req, res) => {
        let _listing = null, _activities = null;

        Promise.resolve()
            .then(_ => ListingsService.findOne({ filter: req.params.id }))
            .then(listing => {
                _listing = listing;
                return ActivitiesService.findMany({ filter: { listing_id: listing._id }, sort: { name: 1 } });
            })
            .then(activities => {
                _activities = activities;
                return ListingsService.relatedListings(_listing);
            })
            .then(related =>
                res.render('listing', {
                    authentication: req.authentication,
                    title: _listing.name + ' - BoredPass',
                    moment: require('moment'),
                    marked: marked,
                    listing: _listing,
                    activities: _activities,
                    related: related,
                    makeUrlFriendly: StringUtils.makeUrlFriendly,
                    location: (_listing.location && _listing.location.coordinates) || null,
                    calculateBearing: ListingsService.calculateBearing,
                    categories: req.listing_categories
                })
            )
            .catch(err => res.status(500).render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`,
                categories: req.listing_categories
            }));
    });