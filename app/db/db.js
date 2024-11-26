import mongodb from 'mongodb';

const connect = async function(config) {
    const data = {
        clients: [],
        connections: {},
    }

    const connections = Array.isArray(config.mongodb) ? config.mongodb : config.mongodb.split(',').map(x => x.trim()).filter(x => x !== '')
    data.clients = await Promise.all(connections.map(async (info, index) => {
        const {url,username, password} = info;
        let connectionUrl = url
        try {
            // const client = await mongoose.Mongoose.connect(connectionUrl);
            const client = await mongodb.MongoClient.connect(connectionUrl)

            return {
                connectionName: `connection${index}`,
                client,
                info: info
            };
        } catch (error) {
            console.error(`Could not connect to database using connectionString: ${connectionUrl.replace(/(mongo.*?:\/\/.*?:).*?@/, '$1****@')}"`);
            throw error;
        }
    }))

    // update the collections list
    data.updateCollections = async function (dbConnection) {
        if (!dbConnection.fullName) {
            console.error('Received db instead of db connection');
            return [];
        }
        const collections = await dbConnection.db.listCollections().toArray();
        const names = [];
        for (const collection of collections) {
            names.push(collection.name);
        }
        data.collections[dbConnection.fullName] = names.sort();
        return collections;
    };

    // update database list
    data.updateDatabases = async function () {
        data.connections = {};
        data.collections = {};
        await Promise.all(
            data.clients.map(async (connectionInfo) => {
                const addConnection = (db, dbName) => {
                    const fullName = data.clients.length > 1
                        ? `${connectionInfo.connectionName}_${dbName}`
                        : dbName;
                    const newConnection =  {
                        info: connectionInfo,
                        dbName,
                        fullName,
                        db,
                    };
                    data.connections[fullName] = newConnection;
                    return newConnection;
                };

                const dbConnection = connectionInfo.client.db();
                const dbName = dbConnection.databaseName;
                const connection = addConnection(dbConnection, dbName);
                await data.updateCollections(connection);
            }),
        );
    };

    if (!data.mainClient) {
        data.mainClient = data.clients[0]
    }

    await data.updateDatabases()

    return data;
}

export default connect;
