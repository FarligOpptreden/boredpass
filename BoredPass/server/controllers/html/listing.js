import Controller from '../../../handlr/Controller';

export default new Controller('/listings')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_listing', {
      title: 'Add Listing - BoredPass',
      moment: require('moment')
    });
  })
  .handle({ route: '/add/done', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_listing_done', {
      title: 'Add Listing - BoredPass',
      moment: require('moment')
    });
  })
  .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
    res.render('listing', {
      title: 'Listing Name - BoredPass',
      moment: require('moment')
    });
  });