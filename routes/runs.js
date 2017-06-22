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

var router = express.Router();
var debug = require('debug')('weathergen-api:runs');


router.get("/:uid", function(req, res) {
    var wd = path.join(config.run_folder, req.params.uid);

    debug("In GET for runs/" + req.params.uid);
    fs.readFile(path.join(wd, "weathergen.zip"), function(err, data) {
        if(err) {
            if(err.code === 'ENOENT') {
                // already generated zip file does not exist
                // so this must be a single run and we have to
                // create it ourselves
                debug("Trying to make a zip for a single run with %s and %s",
                    path.join(wd, "inputs.json"),
                    path.join(wd, "data.json"));

                var zip = new AdmZip();
                zip.addLocalFile(path.join(wd, "inputs.json"));
                zip.addLocalFile(path.join(wd, "data.json"));
                //zip.writeZip("/home/tbadams45/files.zip");

                var zipped = zip.toBuffer();
                res.send(zipped);
                /*res.zip([
                    {path: path.join(wd, "inputs.json"), name: "inputs.json"},
                    {path: path.join(wd, "data.json"), name: "data.json"},
                ]);*/
                debug("Past res.zip");
                return;
            }
        }

        // otherwise, this is a batch file and we can send the already
        // created zip file
        res.sendFile(path.join(wd, "weathergen.zip"));
    });
});

module.exports = router;