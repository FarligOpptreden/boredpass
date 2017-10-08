import Controller from '../../../handlr/Controller';

export default new Controller('/activities')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_activity', {
      title: 'Add Activity - BoredPass',
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
    res.render('activity', {
      title: 'Activity Name - BoredPass',
      moment: require('moment')
    });
  });