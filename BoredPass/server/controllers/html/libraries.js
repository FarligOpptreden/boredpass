import Controller from '../../../handlr/Controller';
import { TagsService, ContentService } from '../../services/_all';

export default new Controller('/libraries')
    .handle({ route: '/tags/search', method: 'get', produces: 'json' }, (req, res) => {
        TagsService.findMany({
            filter: { name: { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
            sort: { name: 1 },
            limit: 5
        }, (tags) => {
            res.json(tags);
        });
    })
    .handle({ route: '/tags/list', method: 'get', produces: 'html' }, (req, res) => {
        TagsService.findMany({
            filter: {},
            sort: { name: 1 }
        }, (tags) => {
            res.render('partials/tag_library', {
                authentication: req.authentication,
                tags: tags
            });
        });
    })
    .handle({ route: '/banners/list', method: 'get', produces: 'html' }, (req, res) => {
        ContentService.listBanners(null, (files) => {
            res.render('partials/banner_library', {
                authentication: req.authentication,
                banners: files
            });
        });
    });