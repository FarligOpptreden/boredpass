import { Controller, konsole } from '../../handlr/_all';
import { ListingsService, TagsService } from '../services/_all';
import moment from 'moment';
import marked from 'marked';

export default Controller.create('/')
    // Show default index page
    .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');

        if (req.query.lat && req.query.lng)
            return ListingsService.listingsWithProximity({ lat: req.query.lat, lng: req.query.lng })
                .then(r => res.render('partials/listing_cards', {
                    authentication: req.authentication,
                    listings: r.listings,
                    moment: moment,
                    marked: marked
                }));

        if (req.query.all)
            return ListingsService.defaultListings()
                .then(r => res.render('partials/listing_cards', {
                    authentication: req.authentication,
                    listings: r.listings,
                    moment: moment,
                    marked: marked
                }));

        ListingsService.statistics(tags => res.render('home', {
            authentication: req.authentication,
            title: 'Activities Near You - Bored Today',
            tags: tags,
            moment: moment,
            marked: marked
        }));
    });