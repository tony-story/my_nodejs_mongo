import express from "express";
import db from "../db/db.js";
import routes from '../service/index.js'
import {buildDatabaseURL, buildCollectionURL} from "../service/utils.js";
import {verifySignature} from "./auth.js";


const router = async function(config) {
    const appRouter = express.Router()
    let mongo = null;

    try {
        mongo = await db(config)
    } catch (error) {
        console.debug(error);
    }

    appRouter.get(config.health.path, (req, res) => {
        res.json({status: 'ok'})
    });

    appRouter.all('*', async function (req, res, next) {
        // if (!verifySignature(req, config)) {
        //     console.error('verify sign error')
        //     return
        // }
        res.locals.baseHref = buildBaseHref(req.originalUrl, req.url)
        next()
    })

    appRouter.param('database', function (req, res, next, id) {
        console.log('database id:'+ id)
        if (!mongo.connections[id]) {
            console.error("connection not found")
            return res.redirect(res.locals.baseHref)
        }

        req.dbName = id
        res.locals.dbName = id
        res.locals.dbUrl = buildDatabaseURL(res.locals.baseHref, id)

        req.dbConnection = mongo.connections[id]
        req.db = mongo.connections[id].db
        next()
    });

    // :collection param MUST be preceded by a :database param
    appRouter.param('collection', function (req, res, next, id) {
        // Make sure collection exists

        console.log('collection id: '+ id)
        if (!mongo.collections[req.dbName].includes(id)) {
            return res.redirect(res.locals.baseHref + 'db/' + req.dbName);
        }

        req.collectionName = id;
        res.locals.collectionName = id;
        res.locals.collectionUrl = buildCollectionURL(res.locals.baseHref, res.locals.dbName, id);

        res.locals.collections = mongo.collections[req.dbName];

        const coll = mongo.connections[req.dbName].db.collection(id);
        console.log('coll connection local: '+ JSON.stringify(res.locals))

        if (coll === null) {
            return res.redirect(res.locals.baseHref + 'db/' + req.dbName);
        }

        req.collection = coll;

        next();
    });

    // :document param MUST be preceded by a :collection param
    appRouter.param('document', async function (req, res, next, id) {
        console.log('document id: '+ id)
        if (id === 'undefined' || id === undefined) {
            return res.redirect(res.locals.baseHref + 'db/' + req.dbName + '/' + req.collectionName);
        }

        id = JSON.parse(decodeURIComponent(id));
        // const _id = buildId(id, req.query);
        let _id ;

        // If an ObjectId was correctly created from passed id param, try getting the ObjID first else falling back to try getting the string id
        // If not valid ObjectId created, try getting string id
        try {
            let doc = await req.collection.findOne({ _id });
            if (doc === null) {
                // No document found with obj_id, try again with straight id
                doc = await req.collection.findOne({ _id: id });
            }
            if (doc === null) {
                console.log('document not found')
            } else {
                // Document found - send it back
                req.document = doc;
                res.locals.document = doc;
                return next();
            }
        } catch (error) {
            console.error(error);
        }
        res.redirect(res.locals.baseHref + 'db/' + req.dbName + '/' + req.collectionName);
    });



    const mongoMiddleware = function (req, res, next) {
        req.client = mongo.mainClient
        next();
    }



    const configuredRoutes = routes(config);

    appRouter.post('/', mongoMiddleware, configuredRoutes.addDatabase)
    appRouter.post('/db/:database', mongoMiddleware, configuredRoutes.addCollection)
    appRouter.post('/db/:database/:collection', mongoMiddleware, configuredRoutes.addDocument)
    appRouter.get('/db/:database/:collection/view/', mongoMiddleware, configuredRoutes.viewCollection);

    return appRouter;
}


const addTrailingSlash = function (s) {
    return s + (s.at(-1) === '/' ? '' : '/');
};

const buildBaseHref = function (originalUrl, reqUrl) {
    if (reqUrl === '/') {
        return addTrailingSlash(originalUrl);
    }
    const idx = originalUrl.lastIndexOf(reqUrl);
    const rootPath = originalUrl.slice(0, idx);
    return addTrailingSlash(rootPath);
};

export default router;
