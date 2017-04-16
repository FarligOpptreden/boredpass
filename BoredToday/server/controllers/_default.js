import Controller from '../../handlr/Controller';
import DefaultService from  '../services/_default';

export default new Controller('')
    // Show default index page
    .handle({ route: '/', method: 'get', produces: 'html' }, (req, res) => {
        DefaultService.recommendedActivities({
            pageNo: 1,
            callback: (activities) => {
                res.render('_default', {
                    title: 'Activities Near You - Bored Today',
                    activities: activities
                });
            }
        });
    });