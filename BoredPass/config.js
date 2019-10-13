export default {
  loggingLevel: {
    http: 1
  },
  port: 13372,
  app: {
    id: "",
    name: "Boredpass",
    debug: true
  },
  accounts: {
    url: "http://www.boredpass.dev:85/sign-in"
  },
  connectionStrings: {
    boredPass: "mongodb://localhost:27017/boredpass_uat"
  },
  keys: {
    google: "AIzaSyAZUoe5UrYFsn4Yqr6FoMOhPY0sJSUkl84",
    locationIq: "4ff3c23b09b2b0"
  },
  oauth: {
    settings: {
      redirect: "http://localhost:13372/secure/oauth/{provider}/result"
    },
    facebook: {
      key: "488377754995784",
      secret: "f3129f8b0d64b4238a00dfa845a0281a",
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
      key:
        "706431443750-l0uutsc09ipgd1bm50ihjcrtrrhr1vc6.apps.googleusercontent.com",
      secret: "qKaKGVZknbkMhgGYJmoOUN3T",
      authUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={key}&response_type=code&scope={scope}&redirect_uri={redirect}",
      tokenUrl:
        "https://www.googleapis.com/oauth2/v4/token?client_id={key}&redirect_uri={redirect}&client_secret={secret}&code={code}&grant_type=authorization_code",
      profileUrl:
        "https://www.googleapis.com/plus/v1/people/me?access_token={token}",
      scope: "openid email profile"
    },
    twitter: {
      key: "Zp5vYGorkEN3OaLOhK2JizPFY",
      secret: "zGX3YdH3LnLTUM6bl5AtkCDSSZCWampw2lV2lYjUUUaXNkuUEt",
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
