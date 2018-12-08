import config from '../../config';
import { BasicCrudPromises, konsole } from '../../handlr/_all';
import { v4 } from 'uuid';
import moment from 'moment';
import fetch from 'node-fetch';
import { Utils } from '../../handlr/_all';
import Twitter from 'node-twitter-api';
const crypto = require('crypto');

class Security extends BasicCrudPromises {
    constructor() {
        super(config.connectionStrings.boredPass, 'users');
        this.twitter_tokens = {};
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

    signInOauth(profile) {
        return new Promise((resolve, reject) => {
            if (!profile)
                return reject({ success: false });

            let token = v4().replace(/\-/g, '');
            let userId;

            Promise.resolve()
                .then(_ => this.findOne({
                    filter: {
                        email: profile.email
                    }
                }))
                .then(user => {
                    if (!user)
                        return this.create({
                            data: {
                                name: profile.name,
                                email: profile.email,
                                password: null,
                                profile_pictures: {
                                    boredPass: null,
                                    facebook: profile.facebook_picture || null,
                                    google: profile.google_picture || null,
                                    twitter: profile.twitter_picture || null
                                },
                                tokens: [token]
                            }
                        });


                    userId = user._id.toString();
                    let profilePictureKey = '', profilePictureValue = '';

                    if (profile.facebook_picture) {
                        profilePictureKey = 'profile_pictures.facebook';
                        profilePictureValue = profile.facebook_picture;
                    }

                    if (profile.google_picture) {
                        profilePictureKey = 'profile_pictures.google';
                        profilePictureValue = profile.google_picture;
                    }

                    if (profile.twitter_picture) {
                        profilePictureKey = 'profile_pictures.twitter';
                        profilePictureValue = profile.twitter_picture;
                    }

                    let data = {
                        $push: { tokens: token }
                    };

                    data[profilePictureKey] = profilePictureValue;

                    return this.update({
                        filter: { _id: user._id },
                        data: data
                    })
                })
                .then(user => {
                    resolve({ success: true, userId: userId || user._id, token: token })
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

    startOauth(req, res) {
        let provider = config.oauth[req.params.provider];

        SecurityService[`start_${req.params.provider}`]({
            req: req,
            res: res,
            provider: provider
        });
    }

    endOauth(req, res) {
        let provider = config.oauth[req.params.provider];

        SecurityService[`end_${req.params.provider}`]({
            req: req,
            res: res,
            provider: provider
        })
            .then(result => {
                res.cookie('bp', Buffer.from(`${result.userId}:${result.token}`).toString('base64'), {
                    maxAge: 3600000 * 24 * 365, // 1 year
                    httpOnly: true
                });
                res.redirect(req.cookies.oauth_redirect);
            })
            .catch(err => res.status(500).send(err));
    }

    start_facebook(args) {
        let url = args.provider.authUrl
            .replace('{key}', args.provider.key)
            .replace('{redirect}', config.oauth.settings.redirect.replace('{provider}', args.req.params.provider))
            .replace('{state}', 'DEVTEST')
            .replace('{scope}', args.provider.scope);
        args.res.redirect(url);
    }

    end_facebook(args) {
        return new Promise((resolve, reject) => {
            let req = args.req;
            let res = args.res;
            let provider = args.provider;
            let code = req.query.code;
            let state = req.query.state;

            Utils.chain()
                .then(_ => {
                    let url = provider.tokenUrl
                        .replace('{key}', provider.key)
                        .replace('{secret}', provider.secret)
                        .replace('{redirect}', config.oauth.settings.redirect.replace('{provider}', req.params.provider))
                        .replace('{code}', code)
                        .replace('{scope}', provider.scope);

                    return fetch(url);
                })
                .then(res => res.json())
                .then(json => {
                    konsole.log(json, 'FACEBOOK-2');

                    let proof = crypto
                        .createHmac('sha256', provider.secret)
                        .update(json.access_token)
                        .digest('hex');
                    let url = provider.profileUrl
                        .replace('{token}', json.access_token)
                        .replace('{fields}', provider.fields)
                        .replace('{proof}', proof);

                    return fetch(url);
                })
                .then(res => res.json())
                .then(json => SecurityService.signInOauth({
                    name: json.name,
                    email: json.email,
                    facebook_picture: json.picture.data.url
                }))
                .then(token => resolve(token))
                .catch(err => {
                    konsole.error(err, 'FACEBOOK');
                    reject(err);
                });
        });
    }

    start_google(args) {
        let url = args.provider.authUrl
            .replace('{key}', args.provider.key)
            .replace('{redirect}', config.oauth.settings.redirect.replace('{provider}', args.req.params.provider))
            .replace('{scope}', args.provider.scope);
        args.res.redirect(url);
    }

    end_google(args) {
        return new Promise((resolve, reject) => {
            let req = args.req;
            let res = args.res;
            let provider = args.provider;
            let code = req.query.code;
            let state = req.query.state;

            Utils.chain()
                .then(_ => {
                    let url = provider.tokenUrl
                        .replace('{key}', provider.key)
                        .replace('{secret}', provider.secret)
                        .replace('{redirect}', config.oauth.settings.redirect.replace('{provider}', req.params.provider))
                        .replace('{code}', code);

                    return fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                })
                .then(res => res.json())
                .then(json => {
                    let url = provider.profileUrl
                        .replace('{token}', json.access_token)
                        .replace('{fields}', provider.fields);

                    return fetch(url);
                })
                .then(res => res.json())
                .then(json => SecurityService.signInOauth({
                    name: json.displayName,
                    email: json.emails[0].value,
                    google_picture: json.image.url
                }))
                .then(token => resolve(token))
                .catch(err => {
                    konsole.error(err, 'GOOGLE');
                    reject(err);
                });
        });
    }

    start_twitter(args) {
        let url = args.provider.authUrl;
        let twitter = new Twitter({
            consumerKey: args.provider.key,
            consumerSecret: args.provider.secret,
            callback: config.oauth.settings.redirect.replace('{provider}', args.req.params.provider)
        });

        twitter.getRequestToken((err, token, secret) => {
            if (err)
                return args.res.status(500).send(err);

            SecurityService.twitter_tokens[token] = secret;
            args.res.redirect(url.replace('{token}', token));
        });
    }

    end_twitter(args) {
        return new Promise((resolve, reject) => {
            let url = args.provider.authUrl;
            let twitter = new Twitter({
                consumerKey: args.provider.key,
                consumerSecret: args.provider.secret,
                callback: config.oauth.settings.redirect.replace('{provider}', args.req.params.provider)
            });
            let requestToken = args.req.query.oauth_token;
            let requestSecret = SecurityService.twitter_tokens[requestToken];
            let verifier = args.req.query.oauth_verifier;

            twitter.getAccessToken(requestToken, requestSecret, verifier, (err, token, secret) => {
                delete SecurityService.twitter_tokens[requestToken];

                if (err)
                    return reject(err);

                twitter.verifyCredentials(token, secret, { include_email: true }, (err, user) => {
                    if (err)
                        return reject(err);

                    SecurityService.signInOauth({
                        name: user.name,
                        email: user.email,
                        twitter_picture: user.profile_image_url
                    })
                        .then(token => resolve(token));
                });
            });
        });
    }
}

export const SecurityService = new Security();