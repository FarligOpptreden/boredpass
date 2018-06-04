import config from '../../config';
import { BasicCrudPromises, konsole } from '../../handlr/_all';
import { v4 } from 'uuid';
import moment from 'moment';
const crypto = require('crypto');

class Security extends BasicCrudPromises {
    constructor() {
        super(config.connectionStrings.boredPass, 'users');
    }

    isAuthenticated(args) {
        return new Promise((resolve, reject) => {
            if (!args || !args.cookie)
                return reject(false);

            let cookie;
            try {
                cookie = Buffer.from(args.cookie, 'base64').toString('ascii');
            }
            catch (e) {
                return reject(false);
            }

            let userId = cookie.split(':')[0];
            let token = cookie.split(':')[1];

            if (!userId || !cookie)
                return reject(false);

            Promise.resolve()
                .then(_ => this.findOne({
                    filter: {
                        _id: this.db.objectId(userId),
                        tokens: token
                    }
                }))
                .then(user => {
                    if (!user)
                        return reject(false);

                    user.token = token;
                    resolve(user);
                })
                .catch(err => {
                    konsole.error(err.toString());
                    reject(false);
                });
        });
    }

    signIn(args, res) {
        return new Promise((resolve, reject) => {
            if (!args)
                return reject({ success: false });

            let token, userId;

            Promise.resolve()
                .then(_ => this.findOne({
                    filter: {
                        email: args.email,
                        password: crypto.createHash('sha256').update(`${args.email}:${args.password}`).digest('hex')
                    }
                }))
                .then(user => {
                    if (!user)
                        return reject({ success: false });

                    token = v4().replace(/\-/g, '');
                    userId = user._id.toString();
                    return this.update({
                        filter: { _id: user._id },
                        data: {
                            $push: { tokens: token }
                        }
                    })
                })
                .then(user => {
                    res.cookie('bp', Buffer.from(`${userId}:${token}`).toString('base64'), {
                        maxAge: 3600000 * 24 * 365, // 1 year
                        httpOnly: true
                    });
                    resolve({ success: true });
                })
                .catch(err => {
                    konsole.error(err.toString());
                    reject({ success: false });
                });
        });
    }

    signOut(req, res) {
        return new Promise((resolve, reject) => {
            if (!req || !res || !req.authentication || !req.authentication.isAuthenticated)
                return reject(false);

            res.clearCookie('bp');

            Promise.resolve()
                .then(_ => this.update({
                    filter: {
                        _id: req.authentication.user._id
                    },
                    data: {
                        $pullAll: { tokens: [req.authentication.user.token] }
                    }
                }))
                .then(user => resolve(true))
                .catch(err => {
                    konsole.error(err.toString());
                    reject(false);
                });
        });
    }

    signUp(args) {
        return new Promise((resolve, reject) => {
            if (!args)
                return reject({ success: false, message: 'No value specified for parameter "args"' });

            let errors = [];

            !args.name && errors.push('No value specified for "name"');
            args.name && args.name.length < 3 && errors.push('Field "name" should be 3 or more characters');
            !args.email && errors.push('No value specified for "email"');
            args.email && !/^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9\-\_]+(\.[a-zA-Z]+){1,2}$/.test(args.email) && errors.push('Field "email" should be a valid email address');
            !args.password && errors.push('No value specified for "password"');
            !args.passwordConfirm && errors.push('No value specified for "passwordConfirm"');
            args.password && args.password.length < 6 && !/(.*[A-Z]+.*[0-9]+.*)|(.*[0-9]+.*[A-Z]+.*)/.test(args.password) && errors.push('Field "password" has to to be at least 6 characters long and contain at least one number and one capital letter');
            args.password && args.passwordConfirm && args.password !== args.passwordConfirm && errors.push('Password and confirmation do not match');

            if (errors.length)
                return reject({ success: false, message: errors });

            Promise.resolve()
                .then(_ => this.findOne({
                    filter: {
                        email: args.email
                    }
                }))
                .then(user => {
                    if (user)
                        return reject({ success: false, message: 'Email address already exists' });

                    return this.create({
                        data: {
                            name: args.name,
                            email: args.email,
                            password: crypto.createHash('sha256').update(`${args.email}:${args.password}`).digest('hex')
                        }
                    });
                })
                .then(user => {
                    if (!user)
                        return reject({ success: false, message: 'Could not register user' });

                    resolve({ success: true, message: 'Successfully registered' });
                })
                .catch(err => {
                    konsole.error(err);
                    reject({ success: false, message: err.toString() });
                });
        });
    }
}

export const SecurityService = new Security();