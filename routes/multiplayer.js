const express = require('express');
const router = express.Router();
const rooms = require('../rooms');

const roomList = [];

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './client/multiplayer' });
});

router.get('/*', (req, res) => {
    res.sendFile('room.html', { root: './client/multiplayer' });
})

module.exports = router;