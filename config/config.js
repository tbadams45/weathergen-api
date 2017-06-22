/**
 * Created by tbadams45 on 6/20/17.
 */
var path = require('path');
var rootPath = path.normalize(__dirname + "/.."); // parent dir

module.exports = {
    development: {
        env: 'development',
        root: rootPath,
        run_folder: path.join(rootPath, 'runs'),
        queue_folder: path.join(rootPath, 'queue'),
        app: {
            name: 'weathergen API - dev'
        }
    },
    production: {
        env: 'production',
        root: rootPath,
        run_folder: path.join(rootPath, 'runs'),
        queue_folder: path.join(rootPath, 'queue'),
        app: {
            name: 'weathergen API'
        }
    }
}