/**
 * Created by tbadams45 on 6/21/17.
 */

var express = require('express');
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
//var zip = require('express-zip');
var AdmZip = require('adm-zip');
var aws    = require('aws-sdk');


var s3     = new aws.S3();
var router = express.Router();
var debug = require('debug')('weathergen-api:routes_runs');

var bucket = config.aws_bucket;


router.get("/:uid", function(req, res) {
    var wd = path.join(config.run_folder, req.params.uid);
    debug("In GET for runs/" + req.params.uid);

    var key = "runs/" + req.params.uid + ".zip";
    var params = {Bucket: bucket, Key: key};
    s3.getObject(params).createReadStream().pipe(res);
});

module.exports = router;