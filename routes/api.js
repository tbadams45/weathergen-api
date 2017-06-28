/**
 * Created by tbadams45 on 6/20/17.
 */
var Promise = require("bluebird");
var express = require('express');
var uuid = require('uuid');
var path = require('path');
var fs = Promise.promisifyAll(require("fs"));
var kue = require('kue');
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
var debug = require('debug')('weathergen-api:routes_api');

var router = express.Router();
var queue = kue.createQueue();


// set up queue events
queue.on('error', function(err) {
    debug('Error in kue... ', err);
});

queue.on('job failed', function(id) {
    var status = {status: "failed"};
    debug("Job failed!");
    kue.Job.get(id, function(err, job) {
        fs.writeFileAsync(path.join(job.data.wd_queue, 'status.json'), JSON.stringify(status));
    });
});

queue.on('job complete', function(id) {
    var status = {status: "complete"};
    debug("Job completed!");
    kue.Job.get(id, function(err, job) {
        fs.writeFileAsync(path.join(job.data.wd_queue, 'status.json'), JSON.stringify(status));
    });
});

// req.body.data, req.body.inputs
router.post('/wgen/single', function(req, res) {
    createJob(req, res, 'single');
});

router.post('/wgen/batch', function(req, res) {
    createJob(req, res, 'batch');
});

// should be called with 'single' or 'batch' from within a Router.METHOD call (hence the req, res)
function createJob(req, res, jobType) {
    var uid = uuid.v4();
    var wd_run  = path.join(config.run_folder, uid); // final location of data, stored on server
    var wd_queue = path.join(config.queue_folder, uid); // holds status

    var data = req.body.data;
    var inputs = req.body.inputs;

    debug("Creating working directory: " + wd_run);

    fs.mkdirAsync(wd_run)
    .then(function() {
        debug('Savings inputs and data files in ', wd_run)
    })
    .then(fs.writeFileAsync(path.join(wd_run, 'inputs.json'), JSON.stringify(inputs)))
    .then(fs.writeFileAsync(path.join(wd_run, 'data.json'), JSON.stringify(data)))
    .then(function() {
        debug('Submitting job');
        var job = queue.create(jobType, {
            title: jobType + ' job',
            wd: wd_run,
            wd_queue: wd_queue,
            uid: uid,
            inputs: inputs
        }).save(function(err) {
            if(err) return res.send(400, 'Error submitting job');
            var status = {status: "pending"};
            fs.mkdirAsync(wd_queue)
            .then(fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status)))
            .then(function() {
                debug("Job saved!");
                res.status(202).send("queue/" + uid);
            });
        });
    })
    .catch(function(err) {
        debug("Got error in POST request for /wgen/" + jobType, err);
    });
}

module.exports = router;
