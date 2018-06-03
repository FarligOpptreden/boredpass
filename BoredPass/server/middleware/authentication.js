import { konsole, CliColors } from '../../handlr/_all';
import { SecurityService } from '../services/_all';

export default class Authorization {
    static get(app) {
        app.all("*", (req, res, next) => {
            SecurityService.isAuthenticated({
                cookie: req.cookies.bp
            })
                .then(r => {
                    req.authentication = {
                        isAuthenticated: r ? true : false,
                        user: r
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