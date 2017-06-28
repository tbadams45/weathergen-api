/**
 * Created by tbadams45 on 6/20/17.
 */
var Promise = require("bluebird");
var kue    = require('kue');
var sleep  = require('thread-sleep');
var debug  = require('debug')('weathergen-api:worker');
var aws    = require('aws-sdk');
var AdmZip = require('adm-zip');
var path   = require('path');
var fs     = Promise.promisifyAll(require("fs"));
var yazl   = require('yazl');
var stream = require('stream');
var env    = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

var jobs   = kue.createQueue();
var s3     = new aws.S3();
var exec   = require('child_process').exec;

var bucket = config.aws_bucket;

jobs.process('single', function(job, done) {
    debug('Processing job: ' + job.id);
    var cmd = 'Rscript ../r/daily_generator.R ' + job.data.wd;
    debug('> ' + cmd);

    var child = exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
            done(stderr);
        } else {
            debug("Results for ", job.data.uid, " are in runs folder");
            debug("Saving to AWS now");

            var zip = new AdmZip();
            var files = [];
            files.push(fs.readFileAsync(path.join(job.data.wd, "inputs.json")));
            files.push(fs.readFileAsync(path.join(job.data.wd, "data.json")));
            files.push(fs.readFileAsync(path.join(job.data.wd, "sim.csv")));
            //files.push(fs.readFileAsync(path.join(job.data.wd, "sim.rda")));

            Promise.all(files).then(function(data) {
                zip.addFile('inputs.json', data[0]);
                zip.addFile('data.json',   data[1]);
                zip.addFile('sim.csv',     data[2]);
                //zip.addFile('sim.rda',     data[3]);

                zip.writeZip("/home/tbadams45/z_the_zipped_file.zip");

                var zipped = zip.toBuffer();

                var key = "runs/" + job.data.uid + ".zip";
                params = {Bucket: bucket, Key: key, Body: zipped};
                s3.putObject(params, function(err, data) {
                    if(err) {
                        debug(err);
                    } else {
                        debug("Succesfully uploaded data to " + bucket + "/" + key + " on AWS");
                        done();
                        //debug("Deleting runs/", job.data.uid, " folder");
                    }
                });
            });
        }
    });
});

jobs.process('batch', function(job, done){
    debug('Processing job: ' + job.id);
    var cmd = 'Rscript ../r/batch_generator.R ' + job.data.wd;
    debug('> ' + cmd);

    var child = exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
            done(stderr);
        } else {
            debug("Results for ", job.data.uid, " are in runs folder");
            debug("Reading runs/" + job.data.uid);
            fs.readFile(path.join(job.data.wd, "weathergen.zip"), function(err, data) {
                debug("Saving to AWS now");
                var key = "runs/" + job.data.uid + ".zip";
                params = {Bucket: bucket, Key: key, Body: data};
                s3.putObject(params, function(err, data) {
                    if(err) {
                        debug(err);
                    } else {
                        debug("Succesfully uploaded data to " + bucket + "/" + key + " on AWS");
                        done();
                        //debug("Deleting runs/", job.data.uid, " folder");
                    }
                });
            });
        }
    });
});