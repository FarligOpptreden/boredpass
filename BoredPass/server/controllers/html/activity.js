import Controller from '../../../handlr/Controller';

export default new Controller('/activities')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('partials/add_activity', null);
  })
  .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
    res.render('activity', {
      title: 'Activity Name - BoredPass',
      moment: require('moment')
    });
  });