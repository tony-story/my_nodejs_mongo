export default {
    mongodb: {
        // `mongodb+srv://${encodedUsername}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority
        url: process.env.CONFIG_DB_MONG_URL || "mongodb://127.0.0.1:27017/test",
        username: process.env.CONFIG_DB_USERNAME || "root",
        password: process.env.CONFIG_DB_PW || ""
    },
    site: {
        baseUrl: "",
        host: process.env.CONFIG_APP_HOST || 'localhost',
        port: process.env.CONFIG_APP_PORT || 8081,
        sslEnabled: true
    },
    options: {
        console: true,
    },
    health: {
        path: process.env.CONFIG_HEALTH_CHECK_PATH || '/status',
    },
    auth: {
        token: process.env.CONFIG_AUTH_SECRET || 'admin'
    }
}
