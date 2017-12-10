import Controller from '../../../handlr/Controller';
import { ListingsService, ActivitiesService, FacilitiesService, TagsService } from '../../services/_all';
import marked from 'marked';

export default new Controller('/listings')
    .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
        FacilitiesService.findMany({
            sort: { name: 1 }
        }, (facilities) => {
            res.render('add_listing', {
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
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        FacilitiesService.findMany({
            sort: { name: 1 }
        }, (facilities) => {
            TagsService.findMany({
                sort: { name: 1 }
            }, (tags) => {
                ListingsService.findOne({
                    filter: req.params.id
                }, (listing) => {
                    ActivitiesService.findMany({
                        filter: { listing_id: listing._id },
                        sort: { name: 1 }
                    }, (activities) => {
                        if (listing.facilities && listing.facilities.length)
                            listing.facilities.map((facility) => {
                                facilities.map((f) => {
                                    if (f._id.toString() === facility._id.toString())
                                        f.selected = true;
                                });
                            });
                        res.render('listing_edit', {
                            title: listing.name + ' - BoredPass',
                            moment: require('moment'),
                            marked: marked,
                            listing: listing,
                            activities: activities,
                            facilities: facilities,
                            tags: tags
                        });
                    });
                });
            });
        });
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