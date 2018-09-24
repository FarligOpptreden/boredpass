import { Controller, konsole } from '../../../handlr/_all';
import { LocationService, SearchService, ListingsService } from '../../services/_all';
import { StringUtils } from '../../utils';
import marked from 'marked';
import moment from 'moment';

export default new Controller('/search')
    .handle({ route: '/load', method: 'get', produces: 'html' }, (req, res) => {
        res.render('partials/find', {
            moment: require('moment')
        });
    })
    .handle({ route: '/location', method: 'get', produces: 'html' }, (req, res) => LocationService.search({
        search: req.query.search
    })
        .then(r => res.send({
            success: true,
            data: r
        }))
        .catch(err => res.send({
            success: false,
            error: err
        }))
    )
    .handle({ route: '/:page', method: 'get', produces: 'html' }, (req, res) => SearchService.find({
        tags: (req.query.tags && req.query.tags.split(',')) || [],
        distance: (req.query.distance !== 'any' && parseFloat(req.query.distance)) || null,
        location: (req.query.lat && req.query.lon && { lat: parseFloat(req.query.lat), lon: parseFloat(req.query.lon) }) || null,
        skip: (parseInt(req.params.page, 10) - 1) * 12,
        limit: 12
    })
        .then(r => {
            let pageNo = parseInt(req.params.page, 10);
            let tags = (r.tags && r.tags.map(t => t.name).join(', ')) || 'Experiences';
            let distance = req.query.distance && `within ${req.query.distance}km from` || 'around';
            let place = req.query.place || 'you';
            res.render('search', {
                title: `${tags} ${distance} ${place} - BoredPass`,
                authentication: req.authentication,
                moment: moment,
                marked: marked,
                results: r.listings,
                recommended: r.recommended,
                skip: (pageNo - 1) * 12,
                limit: 12,
                makeUrlFriendly: StringUtils.makeUrlFriendly,
                search: {
                    tags: r.tags,
                    distance: req.query.distance,
                    location: req.query.place,
                    category: (r.category && r.category[0] && r.category[0].replace(/\s/g, '-').replace('&', 'and').toLowerCase()) || 'home'
                },
                location: req.query.lat && req.query.lon ? [req.query.lon, req.query.lat] : null,
                calculateBearing: ListingsService.calculateBearing,
                prevLink: pageNo > 1 && `/search/${pageNo - 1}?tags=${req.query.tags}&distance=${req.query.distance}&lat=${req.query.lat}&lon=${req.query.lon}`,
                nextLink: (!r.recommended || !r.recommended.length) && `/search/${pageNo + 1}?tags=${req.query.tags}&distance=${req.query.distance}&lat=${req.query.lat}&lon=${req.query.lon}`
            });
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