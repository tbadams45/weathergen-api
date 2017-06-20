/**
 * Created by tbadams45 on 6/20/17.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

module.exports = router;