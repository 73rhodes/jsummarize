#!/usr/bin/env node

const watcher = require('filewatcher')();
const demo  = require('./examples/demo.js').demo;

watcher.add("./examples/data.json");
watcher.on('change', demo)
