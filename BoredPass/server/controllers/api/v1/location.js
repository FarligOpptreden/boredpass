import { ActivitiesService } from '../../../services/_all';
import { Controller } from '../../../../handlr/_all';
import { LocationService } from '../../../services/_all';

export default new Controller('/api/v1/location')
    .handle({ route: '/update-all', method: 'put', produces: 'json' }, (req, res) => {
        LocationService.bulkUpdate()
            .then(d => res.json({ success: true, updated: d }))
            .catch(err => res.json({ success: false, error: err }));
    });