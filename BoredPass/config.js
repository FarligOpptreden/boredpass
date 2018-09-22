export default {
    loggingLevel: {
        http: 1
    },
    port: 13372,
    app: {
        id: '',
        name: 'Boredpass'
    },
    accounts: {
        url: 'http://www.boredpass.dev:85/sign-in'
    },
    connectionStrings: {
        boredPass: 'mongodb://localhost:27017/boredpass_uat'
    },
    keys: {
        google: 'AIzaSyAZUoe5UrYFsn4Yqr6FoMOhPY0sJSUkl84',
        locationIq: '4ff3c23b09b2b0'
    },
    endpoints: {
        locationSearch: 'https://eu1.locationiq.com/v1/search.php?key={token}&q={search}&format=json'
    }
}