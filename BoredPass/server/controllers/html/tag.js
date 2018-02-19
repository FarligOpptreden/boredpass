import Controller from '../../../handlr/Controller';
import { TagsService } from '../../services/_all';

export default new Controller('/tags')
    .handle({ route: '/search', method: 'get', produces: 'html' }, (req, res) => {
        TagsService.findMany({
            filter: { name: { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
            sort: { name: 1 },
            limit: 5
        }, (tags) => {
            res.json(tags);
        });
    });