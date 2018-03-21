import { Controller, konsole } from '../../handlr/_all';
import { ListingsService } from '../services/_all';
import moment from 'moment';

export default Controller.create('/')
    // Show default index page
    .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {
        res.setHeader('Expires', '-1');
        res.setHeader('Cache-Control', 'no-cache');
        ListingsService.findMany({
            sort: { _created: -1 }
        }, (listings) => {
            res.render('home', {
                title: 'Activities Near You - Bored Today',
                listings: listings,
                moment: moment
            });
        });
    });