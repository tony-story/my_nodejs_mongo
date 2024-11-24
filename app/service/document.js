import {buildCollectionURL, isValidDatabaseName, toJsonString, validateCollectionName} from "./utils.js";
import parser from 'mongodb-query-parser';
import {ObjectId} from 'mongodb';

export const toBSON = parser;

const converters = {
    // If type == J, convert value as json document
    J(value) {
        return JSON.parse(value);
    },
    // If type == N, convert value to number
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    N(value) {
        return Number(value);
    },
    // If type == O, convert value to ObjectId
    O(value) {
        return bson.parseObjectId(value);
    },
    // If type == R, convert to RegExp
    R(value) {
        return new RegExp(value, 'i');
    },
    U(value) {
        return new Binary(Buffer.from(value.replaceAll('-', ''), 'hex'), Binary.SUBTYPE_UUID);
    },
    // if type == S, no conversion done
    S(value) {
        return value;
    },
};

const routes = function (config) {
    const exp = {};

    exp.addDocument = async function(req, res) {
        const doc = req.body.document
        // let _doc = {
        //     title: 't1',
        //     name: 'n1',
        //     age: 13
        // }

        // let docBSON;
        // try {
        //     // if (!doc._id) {
        //     //     doc._id = new ObjectId()
        //     // }
        //     let __doc1 = JSON.stringify(doc)
        //     //
        //     // docBSON = toBSON(JSON.parse(__doc1));
        //
        //     docBSON = toBSON.parse(__doc1);
        //
        // } catch (error) {
        //     console.log('param doc: '+ JSON.stringify(doc) + ' ... ' )
        //     console.log('to bson error: '+ error)
        //     console.log('param doc output:'+ doc)
        //     res.redirect('back')
        // }

        await req.collection.insertOne(doc).then( () => {
            console.log('document add')
            res.redirect(buildCollectionURL(res.locals.baseHref, req.dbName, req.collectionName));
        }).catch( (error) => {
            console.error(error);
        })
    };

    exp.addDatabase = async function(req, res) {
        const name = req.body.database
        if (!isValidDatabaseName(name)) {
            console.error('that database name is invalid')
            return res.redirect('back')
        }

        const ndb = req.client.client.db(name);

        await ndb.createCollection('new-tb').then( async () => {
            console.log('database add')
        }).catch( (error) => {
            console.error('database add error')
        })
    };

    exp.addCollection = async function(req, res) {
        const name = req.body.collection;

        if (validateCollectionName(name).error) {
            return res.redirect('back');
        }

        await req.db.createCollection(name).then( async () => {
            console.log('add collection')
            res.redirect(buildCollectionURL(res.locals.baseHref, req.dbName, name))
        }).catch( (error) => {
            console.error(error)
        })
    };

    exp.viewCollection = async function(req, res) {
        try {
            const options = exp._getQueryOptions(req)
            const {items, cnt } = await exp._getItemsAndCount(req, options)

            const docs = []
            let columns = []

            for (const i in items) {
                docs[i] = items[i]
                columns.push(Object.keys(items[i]));
                items[i] = toJsonString(items[i])
            }

            columns = columns.flat()
                .filter( (value, index, arr) => arr.indexOf(value) === index)

            const {limit, skip, sort} = options;
            const pagination = cnt > limit
            const ctx = {
                documents: items,
                docs,
                columns,
                cnt,
                limit,
                skip,
                sort,
                pagination,
                key: req.query.key,
                type: req.query.type,
                query: req.query.query
            }

            console.log('collection data: ' + JSON.stringify(ctx))
            res.json(docs)
            // res.render('collection', ctx)
        }catch (error) {
            console.error(error)
        }
    };

    exp._getQuery = function (req) {
        const { key } = req.query;
        let { value } = req.query;
        if (key && value) {
            // if it is a simple query

            // 1. fist convert value to its actual type
            const type = req.query.type?.toUpperCase();
            if (!(type in converters)) {
                throw new Error('Invalid query type: ' + type);
            }
            value = converters[type](value);

            // 2. then set query to it
            return { [key]: value };
        }
        const { query: jsonQuery } = req.query;
        if (jsonQuery) {
            // if it is a complex query, take it as is;
            const result = toBSON(jsonQuery);
            if (result === null) {
                throw new Error('Query entered is not valid');
            }
            return result;
        }
        return {};
    };

    exp._getSort = function (req) {
        const { sort } = req.query;
        if (sort) {
            const outSort = {};
            for (const i in sort) {
                outSort[i] = Number.parseInt(sort[i], 10);
            }
            return outSort;
        }
        return {};
    };

    exp._getQueryOptions = function (req) {
        return {
            sort: exp._getSort(req),
            // limit: 10,
            skip: Number.parseInt(req.query.skip, 10) || 0,
        };
    };

    exp._getAggregatePipeline = function (pipeline, queryOptions) {
        // https://stackoverflow.com/a/48307554/10413113
        return [
            ...pipeline,
            ...(Object.keys(queryOptions.sort).length > 0) ? [{
                $sort: queryOptions.sort,
            }] : [],
            {
                $facet: {
                    count: [{ $count: 'count' }],
                    items: [
                        { $skip: queryOptions.skip },
                        { $limit: queryOptions.limit + queryOptions.skip },
                        ...(Object.keys(queryOptions.projection).length > 0) ? [{
                            $project: queryOptions.projection,
                        }] : [],
                    ],
                },
            },
        ];
    };

    exp._getItemsAndCount = async function (req, queryOptions) {
        let query = exp._getQuery(req);
        // if (req.query.runAggregate === 'on' && query.constructor.name === 'Array') {
        //     if (query.length > 0) {
        //         const queryAggregate = exp._getAggregatePipeline(query, queryOptions);
        //         const [resultArray] = await req.collection.aggregate(queryAggregate, { allowDiskUse: config.mongodb.allowDiskUse }).toArray();
        //         const { items, count } = resultArray;
        //         return {
        //             items,
        //             count: count.at(0)?.count,
        //         };
        //     }
        //     query = {};
        // }
        const [items, count] = await Promise.all([
            req.collection.find(query, { ...queryOptions, allowDiskUse: config.mongodb.allowDiskUse }).toArray(),
            req.collection.count(query),
        ]);
        return {
            items,
            count,
        };
    };

    return exp;
}

export default routes;
