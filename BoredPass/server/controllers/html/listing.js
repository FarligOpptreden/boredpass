import Controller from '../../../handlr/Controller';
import { ListingsService } from '../../services/_all';

export default new Controller('/listings')
  .handle({ route: '/add', method: 'get', produces: 'html' }, (req, res) => {
    res.render('add_listing', {
      title: 'Add Listing - BoredPass',
      moment: require('moment')
    });
  })
  .handle({ route: '/add', method: 'post', produces: 'json' }, (req, res) => {
    ListingsService.create({
      data: req.body
    }, (result) => {
      res.json({
        success: result && result._id && true,
        id: result._id && result._id
      });
    });
  })
  .handle({ route: '/:id/added', method: 'get', produces: 'html' }, (req, res) => {
    ListingsService.findOne({
      filter: {
        _id: req.params.id
      }
    }, (listing) => {
      res.render('add_listing_done', {
        title: 'Add Listing - BoredPass',
        moment: require('moment'),
        listing: listing
      });
    });
  })
  .handle({ route: '/:id', method: 'get', produces: 'html' }, (req, res) => {
    res.render('listing', {
      title: 'Listing Name - BoredPass',
      moment: require('moment')
    });
  });