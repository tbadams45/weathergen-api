/**
 * Created by tbadams45 on 6/20/17.
 */
var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    kue = require('kue');

var env = process.env.NODE_ENV || 'development';

module.exports = function(app, config) {
    if(config.env === 'development') app.set('showStackError', true);

    if(!fs.existsSync(config.run_folder)) {
        console.log("Creating run folder: " + config.run_folder);
        fs.mkdirSync(config.run_folder);
    }

    app.use(compression());

    app.use(express.static(config.root + '/public'));

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({extended: true}));

    app.set('view engine', 'ejs');
    //app.use('/kue', kue.app);
    require('./routes')(app);

    // error handlers
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


}