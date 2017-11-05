import Controller from '../../../handlr/Controller';
import { ActivitiesService, ListingsService } from '../../services/_all';
import marked from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true
});

export default new Controller('/activities')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_activity', {
      title: 'Add Activity - BoredPass',
      mode: 'new',
      moment: require('moment'),
      listing_id: req.query.listing
    });
  })
  .handle({ route: '/:id/add', method: 'post', produces: 'json' }, (req, res) => {
    let activity = req.body;
    activity.listing_id = ActivitiesService.db.objectId(req.params.id);
    ActivitiesService.create({
      data: activity
    }, (result) => {
      res.json({
        success: result && result._id && true,
        id: result._id && result._id
      });
    });
  })
  .handle({ route: '/add/done', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_listing_done', {
      title: 'Activity Added - BoredPass',
      moment: require('moment')
    });
  })
  .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
    ActivitiesService.findOne({
      filter: req.params.id
    }, (activity) => {
      ListingsService.findOne({
        filter: { _id: activity.listing_id }
      }, (listing) => {
        res.render('activity', {
          title: `${activity.name} - BoredPass`,
          listing: listing,
          activity: activity,
          marked: marked,
          moment: require('moment')
        });
      });
    });
  })
  .handle({ route: '/:id/edit', method: 'get', produces: 'html' }, (req, res) => {
    res.setHeader('Expires', '-1');
    res.setHeader('Cache-Control', 'no-cache');
    ActivitiesService.findOne({
      filter: req.params.id
    }, (activity) => {
      console.log(activity);
      res.render('add_activity', {
        title: `Edit ${activity.name} - BoredPass`,
        mode: 'edit',
        activity: activity,
        moment: require('moment')
      });
    });
  })
  .handle({ route: '/:id/edit', method: 'put', produces: 'json' }, (req, res) => {
    res.setHeader('Expires', '-1');
    res.setHeader('Cache-Control', 'no-cache');
    let activity = req.body;
    ActivitiesService.update({
      filter: req.params.id,
      data: activity
    }, (result) => {
      res.json({
        success: result && true,
        id: result && req.params.id
      });
    });
  });