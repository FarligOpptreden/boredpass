import Controller from '../../../handlr/Controller';
import { ContentService } from '../../services/_all';

export default new Controller('/content')
    .handle({ route: '/svg/:type/:name' }, (req, res) => {
        ContentService.svg({
            type: req.params.type,
            name: req.params.name,
            colour: req.query.colour
        }, (svg) => {
            res.setHeader('content-type', 'image/svg+xml');
            res.send(svg);
        });
    })
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
    })
    .handle({ route: '/thumb/:type/:id/', method: 'get' }, (req, res) => {
        ContentService.readThumb({
            fileId: req.params.id,
            fileType: req.params.type
        }, (data) => {
            res.end(data, 'binary');
        });
    });