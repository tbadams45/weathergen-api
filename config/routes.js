/**
 * Created by tbadams45 on 6/20/17.
 */
module.exports = function(app) {
    app.use('/api', require('../routes/api'));
    app.use('/', require('../routes/index'));
    app.use('/queue', require('../routes/queue'));
    app.use('/runs', require('../routes/runs'));
}