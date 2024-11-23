import * as querystring from "querystring";
import {BSON} from 'mongodb'

export const buildDatabaseURL = function (base, dbName) {
    return base + 'db/' + encodeURIComponent(dbName)
}

export const buildCollectionURL = function (base, dbName, collectionName, queryOptions = {}) {
    let url = buildDatabaseURL(base, dbName) + '/' + encodeURIComponent(collectionName)

    if (Object.keys(queryOptions).length > 0 ) {
        url += '?' + querystring.encode(queryOptions)
    }

    return url
}

export const isValidDatabaseName = function (name) {
    if (!name || name.length > 63) {
        return false;
    }

    if (/["$*./:<>?|"]/.test(name)) {
        return false;
    }

    return true
}


export const validateCollectionName = function (name) {
    if (name === undefined || name.length === 0) {
        return { error: true, message: 'You forgot to enter a collection name!' };
    }

    // Collection names must begin with a letter, underscore, hyphen or slash, (tested v3.2.4)
    // and can contain only letters, underscores, hyphens, numbers, dots or slashes
    if (!/^[/A-Z_a-z-][\w./-]*$/.test(name)) {
        return { error: true, message: 'That collection name is invalid.' };
    }
    return { error: false };
};


const { EJSON } = BSON;

// Convert BSON documents to string
// export const toString = function (doc) {
//     return toJSString(doc, '    ');
// };

export const toJsonString = function (doc) {
    return EJSON.stringify(EJSON.serialize(doc));
};
