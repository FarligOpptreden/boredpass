import { Controller, konsole } from '../../handlr/_all';
import { ListingsService, TagsService } from '../services/_all';
import { StringUtils } from '../utils';
import moment from 'moment';
import marked from 'marked';

export default Controller.create('/')
    // Show default index page
    .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {

        let promise = null, promiseArgs = null;

        if (req.query.lat && req.query.lng) {
            promise = ListingsService.listingsWithProximity;
            promiseArgs = { lat: req.query.lat, lng: req.query.lng };
        }

        if (req.query.all) {
            promise = ListingsService.defaultListings;
            promiseArgs = {};
        }

        if (promise) {
            let categories = [];
            return TagsService
                .uniqueCategories()
                .then(cats => {
                    categories = cats;
                    return Promise.all(categories.map(c => {
                        let args = promiseArgs;
                        args.tags = c.tags;
                        args.limit = 3;
                        return promise(args);
                    }));
                })
                .then(listings =>
                    res.render('partials/listing_cards', {
                        authentication: req.authentication,
                        categories: categories.map((c, i) => {
                            return {
                                category: c.category,
                                urlCategory: c.category.toLowerCase().replace(/\s/g, '-').replace(/\&/g, 'and'),
                                loading: false,
                                listings: listings[i]
                            };
                        }),
                        calculateBearing: ListingsService.calculateBearing,
                        location: req.query.lat && req.query.lng ? [req.query.lng, req.query.lat] : null,
                        moment: moment,
                        marked: marked,
                        makeUrlFriendly: StringUtils.makeUrlFriendly
                    })
                );
        }

        TagsService
            .uniqueCategories()
            .then(categories => {
                let renderArgs = {
                    title: 'Experiences Near You - BoredPass',
                    categories: categories.map((c, i) => {
                        return {
                            category: c.category,
                            urlCategory: encodeURIComponent(c.category).toLowerCase(),
                            loading: true
                        };
                    }),
                    moment: moment,
                    marked: marked,
                    minimalBanner: true,
                    authentication: req.authentication
                };
                if (req.authentication && req.authentication.user && req.authentication.user.permissions && req.authentication.user.permissions.viewStatistics)
                    return ListingsService.statistics()
                        .then(tags => {
                            renderArgs.tags = tags;
                            res.render('home', renderArgs);
                        });

                res.render('home', renderArgs);
            });
    });