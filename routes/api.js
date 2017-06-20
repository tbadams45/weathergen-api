/**
 * Created by tbadams45 on 6/20/17.
 */
var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var kue = require('kue');
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

var jobs = kue.createQueue();

// req.body.data, req.body.inputs
router.post('/wgen/single', function(req, res) {
    console.log(req.body.data);
    console.log(req.body.inputs);
});

router.post('/wgen/batch', function(req, res) {

});

module.exports = router;
