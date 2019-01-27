import { Controller } from '../../../handlr/_all';

export default new Controller('/user')
    .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
        res.render('user', {
            authentication: req.authentication,
            title: 'User Profile - BoredPass',
            categories: req.listing_categories
        });
    });