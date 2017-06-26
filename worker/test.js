/**
 * Created by tbadams45 on 6/26/17.
 */
var debug  = require('debug')('weathergen-api:worker');
var aws    = require('aws-sdk');
var path   = require('path');
var fs     = require('fs');
var env    = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

var s3     = new aws.S3();
var bucket = config.aws_bucket;
var key = "runs/hello_world.txt";
var body = "Hello World!";

params = {Bucket: bucket, Key: key, Body: body};

s3.putObject(params, function(err, data) {
    if(err) {
        debug(err);
    } else {
        debug("Succesfully uploaded data to " + bucket + "/" + key + " on AWS");
    }
});