import { Controller } from '../../handlr/_all';
import { DefaultService } from '../services/_all';
import moment from 'moment';

export default Controller.create('/')
  // Show default index page
  .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {
    DefaultService.recommendedActivities({
      pageNo: 1,
      callback: (activities) => {
        res.render('home', {
          title: 'Activities Near You - Bored Today',
          activities: activities,
          moment: moment
        });
      }
    });
  });