import { Controller, konsole } from '../../../handlr/_all';
import { ListingsService, ActivitiesService, TagsService } from '../../services/_all';
import marked from 'marked';

export default new Controller('/categories')
    .handle({ route: '/:name', method: 'get', produces: 'html' }, (req, res) => ListingsService.listingsByCategory({
        category: req.params.name,
        skip: req.query.skip || 0,
        limit: req.query.limit || 12
    })
        .then(listings => res.render('category_listings', {
            authentication: req.authentication,
            title: `${ListingsService.mappedCategory(req.params.name)} Experiences - BoredPass`,
            moment: require('moment'),
            marked: marked,
            category: ListingsService.mappedCategory(req.params.name),
            urlCategory: req.params.name,
            listings: listings,
            skip: (req.query.skip || 0) + (req.query.limit || 12)
        }))
        .catch(err => {
            res.status(500);
            res.render('error', {
                error: {
                    status: 500
                },
                message: `Something unexpected happened: ${err}`
            });
        })
    )
    .handle({ route: '/:name/:skip', method: 'get', produces: 'html' }, (req, res) => ListingsService.listingsByCategory({
        category: req.params.name,
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
                })
            })
        })
        .catch(err => {
            res.status(500);
            res.render('error', {
                error: {
                    status: 500
                },
                message: `Something unexpected happened: ${err}`
            });
        })
    );