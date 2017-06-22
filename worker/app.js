/**
 * Created by tbadams45 on 6/20/17.
 */
var kue = require('kue');
var jobs = kue.createQueue();
var sleep = require('thread-sleep');

var exec = require('child_process').exec;

jobs.process('single', function(job, done) {
    console.log('Processing job: ' + job.id);
    var cmd = 'Rscript ../r/daily_generator.R ' + job.data.wd;
    console.log('> ' + cmd);

    var child = exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
            done(stderr);
        } else {
            console.log("Done with ", job.data.uid);
            done();
        }
    });

    /*sleep(5000);
    console.log("Done with ", job.data.uid);
    done();*/
});

jobs.process('batch', function(job, done){
    console.log('Processing job: ' + job.id);
    var cmd = 'Rscript ../r/batch_generator.R ' + job.data.wd;
    console.log('> ' + cmd);

    var child = exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
            done(stderr);
        } else {
            console.log("Done with ", job.data.uid);
            done();
        }
    });

    /*sleep(5000);
    console.log("Done with batch job ", job.data.uid);
    done();*/
});
