/**
 * Created by tbadams45 on 6/21/17.
 */
var express = require('express');
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
var debug = require('debug')('weathergen-api:routes_queue');

var router = express.Router();


router.get('/:uid', function(req, res) {
    var uid = req.params.uid;
    var wd  = path.join(config.queue_folder, uid);
    debug("responding to GET at queue/" + uid);
    fs.readFile(path.join(wd, "status.json"), function(err, data) {
        if (err) {
            debug("status ", 404);
            res.status(404).send("Resource does not exist");
            throw err;
        }

        var status = JSON.parse(data).status;
        if (status === "pending") {
            debug("status", status);
            res.status(200).send("pending");
            return;
        } else if (status === "failed") {
            debug("status", status);
            res.status(200).send("failed");
            return;
        } else {
            debug("status", status);
            //res.redirect(303, "/runs/" + uid);
            res.set('location', "/runs/" + uid);
            res.status(303).send();
            return;
        }
    });
});


module.exports = router;