export default {
  loggingLevel: {
    http: 1
  },
  port: 13372,
  app: {
    id: "",
    name: "Boredpass"
  },
  accounts: {
    url: "http://www.boredpass.dev:85/sign-in"
  },
  connectionStrings: {
    boredPass: "SECRET"
  },
  keys: {
    google: "SECRET",
    locationIq: "SECRET"
  },
  oauth: {
    settings: {
      redirect: "http://localhost:13372/secure/oauth/{provider}/result"
    },
    facebook: {
      key: "SECRET",
      secret: "SECRET",
      authUrl:
        "https://www.facebook.com/dialog/oauth?client_id={key}&scope={scope}&redirect_uri={redirect}",
      tokenUrl:
        "https://graph.facebook.com/oauth/access_token?client_id={key}&redirect_uri={redirect}&client_secret={secret}&code={code}&scope={scope}",
      profileUrl:
        "https://graph.facebook.com/v3.2/me?access_token={token}&appsecret_proof={proof}&fields={fields}",
      scope: "public_profile,email",
      fields: "email,picture,name"
    },
    google: {
      key: "SECRET",
      secret: "SECRET",
      authUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={key}&response_type=code&scope={scope}&redirect_uri={redirect}",
      tokenUrl:
        "https://www.googleapis.com/oauth2/v4/token?client_id={key}&redirect_uri={redirect}&client_secret={secret}&code={code}&grant_type=authorization_code",
      profileUrl:
        "https://www.googleapis.com/plus/v1/people/me?access_token={token}",
      scope: "openid email profile"
    },
    twitter: {
      key: "SECRET",
      secret: "SECRET",
      authUrl: "https://api.twitter.com/oauth/authenticate?oauth_token={token}",
      authorizeUrl: "https://api.twitter.com/oauth/authorize",
      tokenUrl: "https://api.twitter.com/oauth/access_token",
      profileUrl: "https://api.twitter.com/1.1/users/show.json"
    }
  },
  endpoints: {
    locationSearch:
      "https://eu1.locationiq.com/v1/search.php?key={token}&q={search}&format=json"
  }
};
