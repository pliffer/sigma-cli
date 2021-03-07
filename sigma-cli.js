#!/usr/bin/env node

//require('./ipc');

let Commands = require('./commands');

let argv = process.argv;

let args = [];

argv.forEach((arg, k) => {

    if(k <= 1) return;

    args.push(arg);

});

Commands.exec(args);
