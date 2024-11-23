export default {
    mongodb: {
        // url: process.env.CONFIG_DB_URL || "mongodb://0.0.0.0:27017/test",
        url: "mongodb+srv://liucon988:M7ULii2wqeJxoGTT@cluster0.b7qrh.mongodb.net/",
        username: process.env.CONFIG_DB_USERNAME || "root",
        password: process.env.CONFIG_DB_PW || ""
    },
    site: {
        baseUrl: "",
        host: process.env.CONFIG_APP_HOST || 'localhost',
        port: process.env.CONFIG_APP_PORT || 8081,
        sslEnabled: false
    },
    options: {
        console: true,
    },
    health: {
        path: process.env.CONFIG_HEALTH_CHECK_PATH || '/status',
    },
    auth: {
        token: process.env.CONFIG_AUTH_SECRET || ''
    }
}
