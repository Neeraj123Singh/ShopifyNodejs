const express = require("express");
const router = new express.Router();


router.use('/product', require('./product'));

module.exports = router;
