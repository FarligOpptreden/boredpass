import config from "../../config";
import { BasicCrudPromises, konsole } from "../../handlr";
import { v4 } from "uuid";
import fetch from "node-fetch";
import Twitter from "node-twitter-api";
import { UserActivityService } from ".";
const crypto = require("crypto");

class Security extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "users");
    this.twitter_tokens = {};
  }

  async create(args) {
    try {
      const user = await super.create(args);
      const activityType = UserActivityService.types.registration;
      await UserActivityService.create({
        data: {
          type: activityType.key,
          title: activityType.display,
          user: {
            _id: user._id,
            name: user.name,
            profile_pictures: user.profile_pictures
          }
        }
      });
    } catch (err) {
      konsole.error(err.toString());
      throw err;
    }
  }

  async isAuthenticated(args) {
    if (!args || !args.cookie) throw false;

    try {
      let cookie;
      try {
        cookie = Buffer.from(args.cookie, "base64").toString("ascii");
      } catch (e) {
        throw false;
      }

      let userId = cookie.split(":")[0];
      let token = cookie.split(":")[1];

      if (!userId || !cookie) throw false;

      let user = await this.findOne({
        filter: {
          _id: this.db.objectId(userId),
          tokens: token
        }
      });

      if (!user) throw false;

      user.token = token;

      return user;
    } catch (err) {
      konsole.error(err.toString());
      throw err;
    }
  }

  async signIn(args, res) {
    if (!args) throw { success: false };

    try {
      let user, token, userId;

      user = await this.findOne({
        filter: {
          email: args.email,
          password: crypto
            .createHash("sha256")
            .update(`${args.email}:${args.password}`)
            .digest("hex")
        }
      });

      if (!user) throw { success: false };

      token = v4().replace(/\-/g, "");
      userId = user._id.toString();
      user = await this.update({
        filter: { _id: user._id },
        data: {
          $push: { tokens: token }
        }
      });
      res.cookie("bp", Buffer.from(`${userId}:${token}`).toString("base64"), {
        maxAge: 3600000 * 24 * 365, // 1 year
        httpOnly: true
      });

      return { success: true };
    } catch (err) {
      konsole.error(err.toString());
      throw { success: false };
    }
  }

  async signInOauth(profile) {
    if (!profile) throw { success: false };

    try {
      let userId;
      let token = v4().replace(/\-/g, "");
      let user = await this.findOne({
        filter: {
          email: profile.email
        }
      });

      if (!user)
        user = await this.create({
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
      else {
        userId = user._id;
        let profilePictureKey = "",
          profilePictureValue = "";

        if (profile.facebook_picture) {
          profilePictureKey = "profile_pictures.facebook";
          profilePictureValue = profile.facebook_picture;
        }

        if (profile.google_picture) {
          profilePictureKey = "profile_pictures.google";
          profilePictureValue = profile.google_picture;
        }

        if (profile.twitter_picture) {
          profilePictureKey = "profile_pictures.twitter";
          profilePictureValue = profile.twitter_picture;
        }

        let data = {
          $push: { tokens: token }
        };

        data[profilePictureKey] = profilePictureValue;
        user = await this.update({
          filter: { _id: user._id },
          data: data
        });
        user._id = userId;
      }

      return { success: true, userId: user._id.toString(), token: token };
    } catch (err) {
      konsole.error(err.toString());
      throw { success: false };
    }
  }

  async signOut(req, res) {
    if (
      !req ||
      !res ||
      !req.authentication ||
      !req.authentication.isAuthenticated
    )
      throw reject(false);

    try {
      res.clearCookie("bp");
      await this.update({
        filter: {
          _id: req.authentication.user._id
        },
        data: {
          $pullAll: { tokens: [req.authentication.user.token] }
        }
      });

      return true;
    } catch (err) {
      konsole.error(err.toString());
      throw err;
    }
  }

  async signUp(args) {
    if (!args)
      throw reject({
        success: false,
        message: 'No value specified for parameter "args"'
      });

    try {
      let errors = [];

      !args.name && errors.push('No value specified for "name"');
      args.name &&
        args.name.length < 3 &&
        errors.push('Field "name" should be 3 or more characters');
      !args.email && errors.push('No value specified for "email"');
      args.email &&
        !/^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9\-\_]+(\.[a-zA-Z]+){1,2}$/.test(
          args.email
        ) &&
        errors.push('Field "email" should be a valid email address');
      !args.password && errors.push('No value specified for "password"');
      !args.passwordConfirm &&
        errors.push('No value specified for "passwordConfirm"');
      args.password &&
        args.password.length < 6 &&
        !/(.*[A-Z]+.*[0-9]+.*)|(.*[0-9]+.*[A-Z]+.*)/.test(args.password) &&
        errors.push(
          'Field "password" has to to be at least 6 characters long and contain at least one number and one capital letter'
        );
      args.password &&
        args.passwordConfirm &&
        args.password !== args.passwordConfirm &&
        errors.push("Password and confirmation do not match");

      if (errors.length) throw { success: false, message: errors };

      let user = await this.findOne({
        filter: {
          email: args.email
        }
      });

      if (user)
        throw {
          success: false,
          message: "Email address already exists"
        };

      user = this.create({
        data: {
          name: args.name,
          email: args.email,
          password: crypto
            .createHash("sha256")
            .update(`${args.email}:${args.password}`)
            .digest("hex")
        }
      });

      if (!user)
        throw {
          success: false,
          message: "Could not register user"
        };

      return { success: true, message: "Successfully registered" };
    } catch (err) {
      konsole.error(err);
      throw { success: false, message: err };
    }
  }

  start_facebook(args) {
    const url = args.provider.authUrl
      .replace("{key}", args.provider.key)
      .replace(
        "{redirect}",
        config.oauth.settings.redirect.replace(
          "{provider}",
          args.req.params.provider
        )
      )
      .replace("{state}", "DEVTEST")
      .replace("{scope}", args.provider.scope);
    args.res.redirect(url);
  }

  async end_facebook(args) {
    try {
      const req = args.req;
      const provider = args.provider;
      const code = req.query.code;
      let url, res, json, proof;

      url = provider.tokenUrl
        .replace("{key}", provider.key)
        .replace("{secret}", provider.secret)
        .replace(
          "{redirect}",
          config.oauth.settings.redirect.replace(
            "{provider}",
            req.params.provider
          )
        )
        .replace("{code}", code)
        .replace("{scope}", provider.scope);

      res = await fetch(url);
      json = await res.json();

      konsole.log(json, "FACEBOOK-2");

      proof = crypto
        .createHmac("sha256", provider.secret)
        .update(json.access_token)
        .digest("hex");
      url = provider.profileUrl
        .replace("{token}", json.access_token)
        .replace("{fields}", provider.fields)
        .replace("{proof}", proof);

      res = await fetch(url);
      json = await res.json();

      const token = await SecurityService.signInOauth({
        name: json.name,
        email: json.email,
        facebook_picture: json.picture.data.url
      });

      return token;
    } catch (err) {
      konsole.error(err, "FACEBOOK");
      throw err;
    }
  }

  start_google(args) {
    const url = args.provider.authUrl
      .replace("{key}", args.provider.key)
      .replace(
        "{redirect}",
        config.oauth.settings.redirect.replace(
          "{provider}",
          args.req.params.provider
        )
      )
      .replace("{scope}", args.provider.scope);
    args.res.redirect(url);
  }

  async end_google(args) {
    try {
      const req = args.req;
      const provider = args.provider;
      const code = req.query.code;
      let url, res, json;

      url = provider.tokenUrl
        .replace("{key}", provider.key)
        .replace("{secret}", provider.secret)
        .replace(
          "{redirect}",
          config.oauth.settings.redirect.replace(
            "{provider}",
            req.params.provider
          )
        )
        .replace("{code}", code);

      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      json = await res.json();

      url = provider.profileUrl
        .replace("{token}", json.access_token)
        .replace("{fields}", provider.fields);

      res = await fetch(url);
      json = await res.json();

      const token = SecurityService.signInOauth({
        name: json.displayName,
        email: json.emails[0].value,
        google_picture: json.image.url
      });

      return token;
    } catch (err) {
      konsole.error(err, "GOOGLE");
      throw err;
    }
  }

  async start_twitter(args) {
    const url = args.provider.authUrl;
    const twitter = new TwitterPromises(
      new Twitter({
        consumerKey: args.provider.key,
        consumerSecret: args.provider.secret,
        callback: config.oauth.settings.redirect.replace(
          "{provider}",
          args.req.params.provider
        )
      })
    );

    try {
      const requestToken = await twitter.getRequestToken();

      SecurityService.twitter_tokens[requestToken.token] = requestToken.secret;
      args.res.redirect(url.replace("{token}", requestToken.token));
    } catch (err) {
      args.res.status(500).send(err);
    }
  }

  async end_twitter(args) {
    try {
      let twitter = new TwitterPromises(
        new Twitter({
          consumerKey: args.provider.key,
          consumerSecret: args.provider.secret,
          callback: config.oauth.settings.redirect.replace(
            "{provider}",
            args.req.params.provider
          )
        })
      );
      const requestToken = args.req.query.oauth_token;
      const requestSecret = SecurityService.twitter_tokens[requestToken];
      const verifier = args.req.query.oauth_verifier;

      const accessToken = await twitter.getAccessToken(
        requestToken,
        requestSecret,
        verifier
      );

      delete SecurityService.twitter_tokens[requestToken];

      const user = await twitter.verifyCredentials(
        accessToken.token,
        accessToken.secret,
        {
          include_email: true
        }
      );

      const token = await SecurityService.signInOauth({
        name: user.name,
        email: user.email,
        twitter_picture: user.profile_image_url
      });

      return token;
    } catch (err) {
      konsole.error(err, "TWITTER");
      throw err;
    }
  }
}

export const SecurityService = new Security();

class TwitterPromises {
  constructor(twitterApi) {
    this._twitter = twitterApi;
  }

  getRequestToken() {
    return new Promise((resolve, reject) => {
      this._twitter.getRequestToken((err, token, secret) => {
        if (err) return reject(err);

        resolve({ token, secret });
      });
    });
  }

  getAccessToken(requestToken, requestSecret, verifier) {
    return new Promise((resolve, reject) => {
      try {
        this._twitter.getAccessToken(
          requestToken,
          requestSecret,
          verifier,
          (err, token, secret) => {
            if (err) return reject(err);

            resolve({ token, secret });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  verifyCredentials(token, secret, scope) {
    return new Promise((resolve, reject) => {
      try {
        this._twitter.verifyCredentials(token, secret, scope, (err, user) => {
          if (err) return reject(err);

          resolve(user);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
