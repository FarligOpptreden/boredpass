import Controller from '../../../handlr/Controller';

export default new Controller('/listings')
    .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
        res.render('partials/add_listing', null);
    })
    .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
        res.render('listing', {
            title: 'Listing Name - BoredPass',
            moment: require('moment')
        });
    });