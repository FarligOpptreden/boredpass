import { Controller } from '../../../handlr/_all';

export default new Controller('/secure')
    .handle({ route: '/sign-in', method: 'get', produces: 'html' }, (req, res) => {
        res.render('partials/sign_in_modal', {});
    });