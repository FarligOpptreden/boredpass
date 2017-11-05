import Controller from '../../../handlr/Controller';
import { TagsService } from '../../services/_all';

export default new Controller('/tags')
  .handle({ route: '/search', method: 'get', produces: 'html' }, (req, res) => {
    TagsService.findMany({
      filter: null,
      sort: { name: 1 }
    }, (tags) => {
      res.json(tags);
    });
  });