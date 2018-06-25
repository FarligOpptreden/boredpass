import { konsole, CliColors } from '../../handlr/_all';
import { SecurityService } from '../services/_all';

export default class Cache {
    static get(app) {
        app.all("*", (req, res, next) => {
            if (req.method === 'GET' && req.headers && req.headers.accept && req.headers.accept.indexOf('image') >= 0)
                return next();
            
            res.setHeader('Expires', '-1');
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });
    }
}