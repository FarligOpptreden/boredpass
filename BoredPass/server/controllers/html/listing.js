﻿import Controller from '../../../handlr/Controller';
import { ListingsService, ActivitiesService } from '../../services/_all';
import marked from 'marked';

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
    ListingsService.findOne({
      filter: req.params.id
    }, (listing) => {
      ActivitiesService.findMany({
        filter: { listing_id: listing._id },
        sort: { name: 1 }
      }, (activities) => {
        res.render('listing', {
          title: listing.name + ' - BoredPass',
          moment: require('moment'),
          marked: marked,
          listing: listing,
          activities: activities
        });
      });
    });
  });