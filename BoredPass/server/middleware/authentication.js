import { SecurityService } from '../services/_all';
import { StringUtils } from '../utils';

export default class Authorization {
    static get(app) {
        app.all("*", (req, res, next) => {
            if (/^\/content\/.*/.test(req.url))
                return next();
            
            SecurityService.isAuthenticated({
                cookie: req.cookies.bp
            })
                .then(r => {
                    req.authentication = {
                        isAuthenticated: r ? true : false,
                        user: r,
                        utils: StringUtils
                    };
                    next();
                })
                .catch(err => {
                    req.authentication = {
                        isAuthenticated: false,
                        user: null
                    };
                    next();
                });
        });
    }
}