/**
 * Created by tbadams45 on 6/20/17.
 */
var express = require('express');
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var kue = require('kue');
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

var router = express.Router();
var jobs = kue.createQueue();

// req.body.data, req.body.inputs
router.post('/wgen/single', function(req, res) {
    var uid = uuid.v4();
    var wd_run  = path.join(config.run_folder, uid); // final location of data, stored on server
    var wd_queue = path.join(config.queue_folder, uid); // holds status
    
    var data = req.body.data;
    var inputs = req.body.inputs;

    console.log("Creating working directory: " + wd_run);

    fs.mkdir(wd_run, function() {
        console.log('Savings inputs and data files in ', wd_run);
        fs.writeFile(path.join(wd_run, 'inputs.json'), JSON.stringify(inputs), function () {
            fs.writeFile(path.join(wd_run, 'data.json'), JSON.stringify(data), function () {
                console.log('Submitting job');
                var job = jobs.create('single', {
                    title: 'single job',
                    wd: wd_run,
                    uid: uid,
                    inputs: inputs
                }).save(function(err) {
                    if(err) return res.send(400, 'Error submitting job');
                    var status = {status: "pending"};
                    fs.mkdir(wd_queue, function() {
                        fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                            console.log("Job saved!");
                            res.status(202).send("queue/" + uid);
                        });
                    });
                    //res.send(job);
                });
                job.on('failed', function() {
                    var status = {status: "failed"};
                    fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                        console.log("Job failed!");
                    });
                });
                job.on('complete', function() {
                    var status = {status: "complete"};
                    fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                        console.log("Job completed!");
                    });
                });
            });
        });
    });
});

router.post('/wgen/batch', function(req, res) {
    var uid = uuid.v4();
    var wd_run  = path.join(config.run_folder, uid); // final location of data, stored on server
    var wd_queue = path.join(config.queue_folder, uid); // holds status

    var data = req.body.data;
    var inputs = req.body.inputs;

    console.log("Creating working directory: " + wd_run);

    fs.mkdir(wd_run, function() {
        console.log('Savings inputs and data files in ', wd_run);
        fs.writeFile(path.join(wd_run, 'inputs.json'), JSON.stringify(inputs), function () {
            fs.writeFile(path.join(wd_run, 'data.json'), JSON.stringify(data), function () {
                console.log('Submitting job');
                var job = jobs.create('batch', {
                    title: 'batch job',
                    wd: wd_run,
                    uid: uid,
                    inputs: inputs
                }).save(function(err) {
                    if(err) return res.send(400, 'Error submitting job');
                    var status = {status: "pending"};
                    fs.mkdir(wd_queue, function() {
                        fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                            console.log("Job saved!");
                            res.status(202).send("queue/" + uid);
                        });
                    });
                    //res.send(job);
                });
                job.on('failed', function() {
                    var status = {status: "failed"};
                    fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                        console.log("Job failed!");
                    });
                });
                job.on('complete', function() {
                    var status = {status: "complete"};
                    fs.writeFile(path.join(wd_queue, 'status.json'), JSON.stringify(status), function() {
                        console.log("Job completed!");
                    });
                });
            });
        });
    });
});

module.exports = router;
