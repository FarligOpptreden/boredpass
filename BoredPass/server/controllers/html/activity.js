import Controller from '../../../handlr/Controller';

export default new Controller('/activity')
    // Show default index page
    .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
        res.render('partials/add_activity', null);
    });