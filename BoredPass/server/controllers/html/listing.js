import { Controller, konsole } from '../../../handlr/_all';
import { ListingsService, ActivitiesService, FacilitiesService, TagsService } from '../../services/_all';
import marked from 'marked';

export default new Controller('/listings')
    .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
        FacilitiesService.findMany({
            sort: { name: 1 }
        }, (facilities) => {
            res.render('add_listing', {
                authentication: req.authentication,
                title: 'Add Listing - BoredPass',
                moment: require('moment'),
                facilities: facilities
            });
        });
    })
    .handle({ route: '/add', method: 'post', produces: 'json' }, (req, res) => {
        ListingsService.create({
            data: req.body
        }, (result) => {
            res.json({
                success: result && result._id && true,
                id: result._id && result._id
            });
        });
    })
    .handle({ route: '/:id/added', method: 'get', produces: 'html' }, (req, res) => {
        ListingsService.findOne({
            filter: {
                _id: req.params.id
            }
        }, (listing) => {
            res.render('add_listing_done', {
                authentication: req.authentication,
                title: 'Add Listing - BoredPass',
                moment: require('moment'),
                listing: listing
            });
        });
    })
    .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        ListingsService.findOne({
            filter: req.params.id
        }, (listing) => {
            ActivitiesService.findMany({
                filter: { listing_id: listing._id },
                sort: { name: 1 }
            }, (activities) => {
                res.render('listing', {
                    authentication: req.authentication,
                    title: listing.name + ' - BoredPass',
                    moment: require('moment'),
                    marked: marked,
                    listing: listing,
                    activities: activities
                });
            });
        });
    })
    .handle({ route: '/:id/edit', method: 'get', produces: 'html' }, (req, res) => {
        if (!req.authentication || !req.authentication.isAuthenticated) {
            res.status(403);
            res.render('error', {
                error: {
                    status: 403
                },
                message: 'You seem to have stumbled where you don\'t belong. Are you perhaps looking for something else?'
            });
            return;
        }

        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');

        let _listing, _facilities, _activities;

        let getListing = _ => new Promise((resolve, reject) =>
            ListingsService.findOne({
                filter: req.params.id
            }, listing => {
                _listing = listing;
                resolve(listing);
            })
        );

        let getFacilities = listing => new Promise((resolve, reject) =>
            FacilitiesService.findMany({
                sort: { name: 1 }
            }, facilities => {
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
            }, activities => {
                _activities = activities;
                resolve(activities);
            })
        );

        Promise.resolve()
            .then(_ => getListing())
            .then(listing => Promise.all([getFacilities(listing), getActivities(listing)]))
            .then(results => res.render('listing_edit', {
                authentication: req.authentication,
                title: _listing.name + ' - BoredPass',
                moment: require('moment'),
                marked: marked,
                listing: _listing,
                activities: _activities,
                facilities: _facilities
            }))
            .catch(err => konsole.error(err));
    })
    .handle({ route: '/:id/edit', method: 'put', produces: 'json' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        let listing = req.body;
        ListingsService.update({
            filter: req.params.id,
            data: listing
        }, (result) => {
            res.json({
                success: result && true,
                id: result && req.params.id
            });
        });
    })
    .handle({ route: '/:id/delete', method: 'delete', produces: 'json' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        ActivitiesService.deleteMany({
            filter: { listing_id: ActivitiesService.db.objectId(req.params.id) }
        }, (r) => {
            ListingsService.delete({
                filter: req.params.id
            }, (r) => {
                res.json(r);
            });
        });
    });