import { Controller, konsole } from '../../handlr/_all';
import { ListingsService, TagsService } from '../services/_all';
import moment from 'moment';

export default Controller.create('/')
    // Show default index page
    .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        ListingsService.statistics(tags => 
            ListingsService.findMany({
                sort: { _created: -1 }
            }, (listings) => {
                res.render('home', {
                    title: 'Activities Near You - Bored Today',
                    tags: tags,
                    listings: listings,
                    moment: moment
                });
            })
        );
    });