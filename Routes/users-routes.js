const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.send({
        message : 'Got all uses'
    })
}) 

module.exports = router;