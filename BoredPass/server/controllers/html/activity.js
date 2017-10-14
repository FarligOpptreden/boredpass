import Controller from '../../../handlr/Controller';
import { ActivitiesService } from '../../services/_all';

export default new Controller('/activities')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_activity', {
      title: 'Add Activity - BoredPass',
      moment: require('moment')
    });
  })
  .handle({ route: '/add', method: 'post', produces: 'json' }, (req, res) => {
    ActivitiesService.create({
      data: req.body
    }, (result) => {
      res.json({
        success: result && result._id && true,
        id: result._id && result._id
      });
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