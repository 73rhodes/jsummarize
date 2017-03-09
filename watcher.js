#!/usr/bin/env node
/*jshint esversion:6*/

const watcher = require('filewatcher')();
const demo  = require('./examples/demo.js').demo;

watcher.add("./examples/data.json");
watcher.on('change', demo);
