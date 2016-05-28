'use strict';

const path = require('path');
const config = require(path.join(path.resolve(), '/config/database.js'));
const thinky = require('thinky')(config);

module.exports = thinky;
