/**
 * Created by tbadams45 on 6/21/17.
 */
var Promise = require("bluebird");
var express = require('express');
var uuid = require('uuid');
var path = require('path');
var fs = Promise.promisifyAll(require("fs"));
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
var debug = require('debug')('weathergen-api:routes_queue');

var router = express.Router();

router.get('/:uid', function(req, res) {
    var uid = req.params.uid;
    var wd  = path.join(config.queue_folder, uid);
    debug("responding to GET at queue/" + uid);
    debug("attempting to read " + path.join(wd, "status.json"));
    fs.readFileAsync(path.join(wd, "status.json"))
        .then(function(data) {
            debug("in 'then' function");
            var status = JSON.parse(data).status;
            if (status === "pending") {
                debug("status", status);
                res.status(200).send("pending");
            } else if (status === "failed") {
                debug("status", status);
                res.status(200).send("failed");
            } else {
                debug("status", status);
                //res.redirect(303, "/runs/" + uid);
                res.set('location', "/runs/" + uid);
                res.status(303).send();
            }
        })
        .catch(function(err) {
            debug("err " + err);
            debug("status ", 404);
            res.status(404).send("Resource does not exist");
        });
});


module.exports = router;