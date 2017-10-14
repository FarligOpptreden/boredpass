import Controller from '../../../handlr/Controller';
import { ContentService } from '../../services/_all';

export default new Controller('/content')
  .handle({ route: '/upload', method: 'post', produces: 'json' }, (req, res) => {
    ContentService.upload({
      req: req
    }, (d) => {
      res.json(d);
    });
  })
  .handle({ route: '/:type/:id/', method: 'get' }, (req, res) => {
    ContentService.readResource({
      fileId: req.params.id,
      fileType: req.params.type
    }, (path) => {
      res.sendFile(path);
    });
  });