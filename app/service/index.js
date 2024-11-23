import documentRoute from './document.js'


const index = function (config) {
    const exp = {};
    const configureRoute = documentRoute(config);

    exp.addDatabase = configureRoute.addDatabase;
    exp.addCollection = configureRoute.addCollection;
    exp.viewCollection = configureRoute.viewCollection;
    exp.addDocument = configureRoute.addDocument;

    return exp;
}

export default index;
