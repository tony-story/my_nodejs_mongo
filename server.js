import configDefault from './app/config/config.default.js'
import express from "express";
import router from "./app/router/router.js";


let defaultPort = 8091

const app = express()
let server = app;

app.use(express.json())
app.use(express.urlencoded({extended: true}))


const loadConfig = async () => {
    return configDefault
}

async function start(config) {
    // const ware = await middleware(config);
    // app.use(config.site.baseUrl, ware);


    // app.get('/test', (req, res) => {
    //     res.json({status: 'ok'})
    // })
    app.use('/', await router(config))

    const address = (config.site.sslEnabled ? 'https://' : 'http://')
        + (config.site.host || '0.0.0.0') + ':' + (config.site.port || defaultPort)

    server.listen(config.site.port, config.site.host, function () {
        if (config.options.console) {
            console.log('mongo express server listen address ' + address)
        }
    }).on('error', function (e) {
        console.log(JSON.stringify(e));
        return process.exit(1);
    });


}

const config = await loadConfig()

if (!config.site.baseUrl) {
    config.site.baseUrl = '/'
}

await start(config)
