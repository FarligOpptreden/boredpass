import config from '../../../config';
import { Controller, konsole } from '../../../handlr/_all';
import { ListingsService, ActivitiesService, TagsService } from '../../services/_all';
import { StringUtils } from '../../utils';
import marked from 'marked';

export default new Controller('/categories')
    .handle({ route: '/:name', method: 'get', produces: 'html' }, (req, res) => res.render('category_listings', {
        authentication: req.authentication,
        title: `${ListingsService.mappedCategory(req.params.name)} Experiences - BoredPass`,
        moment: require('moment'),
        marked: marked,
        category: ListingsService.mappedCategory(req.params.name),
        urlCategory: req.params.name,
        listings: [],
        skip: (req.query.skip || 0) + (req.query.limit || 12),
        categories: req.listing_categories
    }))
    .handle({ route: '/:name/:skip', method: 'get', produces: 'html' }, (req, res) => ListingsService
        .listingsByCategory({
            category: req.params.name,
            coordinates: req.query.lat && req.query.lng ? { lat: req.query.lat, lng: req.query.lng } : null,
            skip: req.params.skip || 0,
            limit: req.query.limit || 12
        })
        .then(listings => {
            let categories = ListingsService.unmappedCategories(req.params.name);
            res.render('partials/category_listing_cards', {
                moment: require('moment'),
                marked: marked,
                listings: listings,
                category: ListingsService.mappedCategory(req.params.name),
                categories: Object.keys(categories).map(k => {
                    return {
                        url: k,
                        name: categories[k]
                    };
                }),
                calculateBearing: ListingsService.calculateBearing,
                location: req.query.lat && req.query.lng ? [req.query.lng, req.query.lat] : null,
                limit: req.query.limit || 12,
                makeUrlFriendly: StringUtils.makeUrlFriendly
            })
        })
        .catch(err => {
            res.status(500);
            res.render('error', {
                error: {
                    status: 500,
                    stack: config.app.debug && err.stack
                },
                message: `Something unexpected happened: ${err}`
            });
        })
    );